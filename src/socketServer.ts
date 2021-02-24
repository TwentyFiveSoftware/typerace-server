import { Server } from 'socket.io';

const socketServer = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        },
    });

    io.on('connection', (socket) => {
        console.log(`[+] ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`[-] ${socket.id}`);
        });
    });

    return io;
};

export default socketServer;
