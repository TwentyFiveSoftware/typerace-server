import { Player } from '../types/Player';
import { Server } from 'socket.io';
import { LobbyState } from '../types/LobbyState';
import { Game } from './Game';
import { TEXTS } from '../data/texts';

export class Lobby {
    private readonly socketServer: Server;
    public lobbyId: string;
    public game: Game;

    private players: Player[] = [];
    private text: string;

    constructor(socketServer: Server) {
        this.socketServer = socketServer;
        this.lobbyId = Lobby.generateLobbyId();
        this.text = TEXTS[Math.floor(Math.random() * TEXTS.length)];

        this.game = new Game(this.socketServer, this.lobbyId);
    }

    private static generateLobbyId(): string {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let s = '';

        for (let i = 0; i < 5; i++) {
            s += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }

        return s;
    }

    public addPlayer(player: Player): void {
        this.players.push(player);
        this.sendLobbyState();
    }

    private sendLobbyState(): void {
        const lobbyState: LobbyState = { lobbyId: this.lobbyId, players: this.players };
        this.socketServer.to(this.lobbyId).emit('lobbyState', lobbyState);
    }

    public isSocketIdInLobby(socketId: string): boolean {
        return !!this.getPlayerOfSocketId(socketId);
    }

    private getPlayerOfSocketId(socketId: string): Player | null {
        return this.players.find((player) => player.socketId === socketId);
    }

    public togglePlayerReady(socketId: string): void {
        const player: Player = this.getPlayerOfSocketId(socketId);
        if (!player) return;

        player.isReady = !player.isReady;

        if (this.players.length > 1 && !this.players.some((player) => !player.isReady)) {
            this.game.startGame({ players: this.players, text: this.text, gameStartTime: Date.now() });
        }

        this.sendLobbyState();
    }

    public removePlayer(socketId: string): void {
        this.players = this.players.filter((player) => player.socketId !== socketId);
        this.sendLobbyState();
    }

    public isEmpty(): boolean {
        return this.players.length === 0;
    }
}
