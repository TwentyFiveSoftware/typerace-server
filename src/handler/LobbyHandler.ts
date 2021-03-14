import { Lobby } from '../models/Lobby';
import { Server, Socket } from 'socket.io';

export class LobbyHandler {
    private readonly socketServer: Server;
    private lobbies: Lobby[] = [];

    constructor(socketServer: Server) {
        this.socketServer = socketServer;
    }

    public handleLobbyEvents(socket: Socket): void {
        socket.on('joinLobby', (username, lobbyId) => {
            if (!username.match(/^.{1,30}$/)) {
                socket.emit('errorIncorrectUsername');
                return;
            }

            let lobby;

            if (lobbyId.length === 0) {
                lobby = new Lobby(this.socketServer);
                this.lobbies.push(lobby);
            } else {
                lobby = this.getLobbyOfId(lobbyId.toUpperCase());
            }

            if (!lobby || lobby?.game.started) {
                socket.emit('errorLobbyNotFound');
                return;
            }

            socket.join(lobby.lobbyId);

            lobby.addPlayer({
                socketId: socket.id,
                username: username,
                isReady: false,
                isFinished: false,
                finishTime: 0,
                currentTextPosition: 0,
                typingSpeed: 0,
            });

            lobby.game.handleGameEvents(socket);
        });

        socket.on('disconnect', () => {
            this.getLobbyOfSocketId(socket.id)?.removePlayer(socket.id);
            this.lobbies = this.lobbies.filter((lobby) => !lobby.isEmpty());
        });

        socket.on('toggleReady', () => {
            this.getLobbyOfSocketId(socket.id)?.togglePlayerReady(socket.id);
        });
    }

    private getLobbyOfId(lobbyId: string): Lobby | null {
        return this.lobbies.find((lobby) => lobby.lobbyId === lobbyId) ?? null;
    }

    private getLobbyOfSocketId(socketId: string): Lobby | null {
        return this.lobbies.find((lobby) => lobby.isSocketIdInLobby(socketId)) ?? null;
    }
}
