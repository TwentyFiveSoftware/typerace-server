import { Server } from 'socket.io';
import { LobbyHandler } from './handler/LobbyHandler';

const socketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    const lobbyHandler = new LobbyHandler(io);

    io.on('connection', (socket) => {
        console.log(`[+] ${socket.id}`);

        lobbyHandler.handleLobbyEvents(socket);

        // socket.on('disconnect', () => {
        //     console.log(`[-] ${socket.id}`);
        // });
    });

    return io;
};

export default socketServer;
