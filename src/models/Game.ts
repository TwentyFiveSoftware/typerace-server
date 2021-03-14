import { Server, Socket } from 'socket.io';
import { GameState } from '../types/GameState';
import { Player } from '../types/Player';

export class Game {
    public started: boolean = false;

    private socketServer: Server;
    private lobbyId: string;

    private gameState: GameState;

    constructor(socketServer: Server, lobbyId: string) {
        this.socketServer = socketServer;
        this.lobbyId = lobbyId;

        this.gameState = null;
    }

    public startGame(gameState: GameState): void {
        this.gameState = gameState;
        this.started = true;
        this.sendGameState();

        this.startGameInterval();
    }

    private startGameInterval(): void {
        setInterval(() => {
            for (const player of this.gameState.players.filter((p) => !p.isFinished))
                player.typingSpeed = Math.floor(
                    (player.currentTextPosition / ((Date.now() - this.gameState.gameStartTime) / 1000)) * 60,
                );

            if (!this.gameState.players.some((p) => !p.isFinished)) {
                this.gameState.isFinished = true;
            }

            this.sendGameState();
        }, 1000);
    }

    public sendGameState(): void {
        this.socketServer.to(this.lobbyId).emit('gameState', this.gameState);
    }

    private getPlayerOfSocket(socketId: string): Player | null {
        return this.gameState.players.find((player) => player.socketId === socketId) ?? null;
    }

    private restart(): void {
        if (!this.gameState.isFinished) return;

        for (const player of this.gameState.players) {
            player.isFinished = false;
            player.finishTime = 0;
            player.currentTextPosition = 0;
            player.typingSpeed = 0;
            player.playAgain = false;
        }

        this.gameState.isFinished = false;
        this.gameState.gameStartTime = Date.now();

        this.socketServer.to(this.lobbyId).emit('restart');
    }

    public handleGameEvents(socket: Socket): void {
        socket.on('gameUpdate', (currentPos: number) => {
            if (!this.started || this.gameState.isFinished) return;

            const player = this.getPlayerOfSocket(socket.id);
            if (!player || player.isFinished) return;

            if (currentPos === this.gameState.text.length) {
                player.isFinished = true;
                player.finishTime = Date.now();
            }

            player.currentTextPosition = currentPos;
        });

        socket.on('togglePlayAgain', () => {
            if (!this.gameState.isFinished) return;

            const player = this.getPlayerOfSocket(socket.id);
            if (!player) return;

            player.playAgain = !player.playAgain;

            if (!this.gameState.players.some((p) => !p.playAgain)) {
                this.restart();
            }

            this.sendGameState();
        });
    }
}
