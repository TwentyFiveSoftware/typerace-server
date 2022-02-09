import type { DefaultEventProps } from '../../types/DefaultEventProps';
import type { IGame } from './types/Game';
import type { IGameState } from './types/GameState';
import type { ILobby } from '../lobby/types/Lobby';
import { SocketResponseType } from '../../types/SocketResponseType';
import { chooseRandomText } from '../text/textManager';
import { sendLobbyUpdate } from '../lobby/lobbyManager';

const GAME_START_COUNTDOWN_SECONDS = 6;

let games: IGame[] = [];

const startGame = (props: DefaultEventProps, lobby: ILobby): void => {
    if (getGame(lobby.lobbyId) && !getGame(lobby.lobbyId)?.isFinished) return;

    lobby.players.forEach(player => {
        player.isFinished = false;
        player.finishTime = 0;
        player.currentTextPosition = 0;
        player.typingSpeed = 0;
        player.isReady = false;
    });

    const text = chooseRandomText(lobby);

    const game: IGame = {
        gameStartTime: Date.now() + GAME_START_COUNTDOWN_SECONDS * 1000,
        started: true,
        isFinished: false,
        text,
        lobby,
    };

    games = games.filter(game => game.lobby.lobbyId !== lobby.lobbyId);
    games.push(game);

    sendLobbyUpdate(props, lobby.lobbyId);
    startGameUpdateLoop(props, game);
    sendGameUpdate(props, game);
};

const getGameOfPlayer = (socketId: string): IGame | null =>
    games.find(game => game.lobby.players.some(player => player.socketId === socketId)) ?? null;

const getGame = (lobbyId: string | null): IGame | null => games.find(game => game.lobby.lobbyId === lobbyId) ?? null;

const sendGameUpdate = ({ io }: DefaultEventProps, game: IGame | null): void => {
    if (!game) return;

    const gameState: IGameState = {
        players: game.lobby.players,
        gameStartTime: game.gameStartTime,
        text: game.text,
        isFinished: game.isFinished,
    };

    io.to(game.lobby.lobbyId).emit(SocketResponseType.GAME_UPDATE, gameState);
};

const startGameUpdateLoop = (props: DefaultEventProps, game: IGame): void => {
    const interval = setInterval(() => {
        const minutesPassed = (Date.now() - game.gameStartTime) / 60000;

        game.lobby.players
            .filter(player => !player.isFinished)
            .forEach(player => {
                player.typingSpeed = Math.floor(player.currentTextPosition / minutesPassed);
            });

        if (!game.lobby.players.some(player => !player.isFinished)) {
            game.isFinished = true;
            clearInterval(interval);
        }

        sendGameUpdate(props, game);
    }, 1000);
};

const leaveGame = (socketId: string): void => {
    const game = getGameOfPlayer(socketId);
    if (!game) return;

    game.lobby.players = game.lobby.players.filter(player => player.socketId !== socketId);

    games = games.filter(game => game.lobby.players.length > 0);
};

export { getGame, startGame, getGameOfPlayer, sendGameUpdate, leaveGame };
