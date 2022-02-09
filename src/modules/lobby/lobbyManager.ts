import type { ILobby } from './types/Lobby';
import type { IPlayer } from './types/Player';
import type { DefaultEventProps } from '../../types/DefaultEventProps';
import { SocketResponseType } from '../../types/SocketResponseType';

const LOBBY_ID_LENGTH = 5;
const LOBBY_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const CAR_AMOUNT = 9;

let lobbies: ILobby[] = [];

const generateLobbyId = (): string => {
    let id = '';

    for (let i = 0; i < LOBBY_ID_LENGTH; i++)
        id += LOBBY_ID_ALPHABET[Math.floor(Math.random() * LOBBY_ID_ALPHABET.length)];

    return id;
};

const getLobby = (lobbyId: string | null): ILobby | null => lobbies.find(lobby => lobby.lobbyId === lobbyId) ?? null;

const getLobbyIdOfPlayer = (socketId: string): string | null =>
    lobbies.find(lobby => lobby.players.some(player => player.socketId === socketId))?.lobbyId ?? null;

const createLobby = (): ILobby => {
    const lobby: ILobby = {
        lobbyId: generateLobbyId(),
        players: [],
        typedTexts: [],
    };

    lobbies.push(lobby);

    return lobby;
};

const joinLobby = (lobbyId: string, socketId: string, username: string): void => {
    const player: IPlayer = {
        socketId,
        username,
        isReady: false,
        isFinished: false,
        finishTime: 0,
        carIndex: Math.floor(Math.random() * CAR_AMOUNT),
        currentTextPosition: 0,
        typingSpeed: 0,
    };

    getLobby(lobbyId)?.players.push(player);
};

const leaveLobby = (socketId: string): void => {
    const lobby = getLobby(getLobbyIdOfPlayer(socketId));
    if (!lobby) return;

    lobby.players = lobby.players.filter(player => player.socketId !== socketId);

    lobbies = lobbies.filter(lobby => lobby.players.length > 0);
};

const sendLobbyUpdate = ({ io }: DefaultEventProps, lobbyId: string | null): void => {
    if (!lobbyId) return;
    io.to(lobbyId).emit(SocketResponseType.LOBBY_UPDATE, getLobby(lobbyId));
};

const getPlayerOfSocket = (socketId: string): IPlayer | null =>
    getLobby(getLobbyIdOfPlayer(socketId))?.players.find(player => player.socketId === socketId) ?? null;

export { getLobby, createLobby, joinLobby, leaveLobby, getLobbyIdOfPlayer, sendLobbyUpdate, getPlayerOfSocket };
