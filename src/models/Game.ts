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

        setInterval(() => {
            for (let player of gameState.players) {
                if(player.isFinished) continue;
                player.typingSpeed = Math.floor(player.currentTextPosition / ((Date.now() - gameState.gameStartTime) / 1000) * 60);
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

    public handleGameEvents(socket: Socket): void {
        socket.on('gameUpdate', (currentPos: number) => {
            if (!this.started) return;
            if(currentPos == this.gameState.text.length){
                this.getPlayerOfSocket(socket.id).isFinished = true;
            }
            this.getPlayerOfSocket(socket.id).currentTextPosition = currentPos;
        });
    }
}
