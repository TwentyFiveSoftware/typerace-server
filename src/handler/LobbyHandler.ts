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
            let lobby;

            if (lobbyId.length === 0) {
                lobby = new Lobby(this.socketServer);
                this.lobbies.push(lobby);
            } else {
                lobby = this.getLobbyOfId(lobbyId.toUpperCase());
            }

            if (!lobby) {
                socket.emit('lobbyNotFound');
                return;
            }

            socket.join(lobby.lobbyId);
            lobby.addPlayer({ socketId: socket.id, username: username, isReady: false });
        });

        socket.on('disconnect', () => {
            console.log(`[-] ${socket.id}`);
            const lobby = this.getLobbyOfSocketId(socket.id);
            if (lobby === null) return;
            if (lobby.getPlayerNumber() <= 1) {
                this.lobbies = this.lobbies.filter((lobbie) => !lobbie.isSocketIdInLobby(socket.id));
                return;
            }
            lobby.removePlayer(socket.id);
        });

        socket.on('toggleReady', () => {
            this.getLobbyOfSocketId(socket.id)?.togglePlayerReady(socket.id);
        });
    }

    private getLobbyOfId(lobbyId: string): Lobby | null {
        return this.lobbies.find((lobby) => lobby.lobbyId === lobbyId) ?? null;
    }

    private getLobbyOfSocketId(socketId: string): Lobby | null {
        for (const lobby of this.lobbies) {
            if (lobby.isSocketIdInLobby(socketId)) {
                return lobby;
            }
        }

        return null;
    }
}
