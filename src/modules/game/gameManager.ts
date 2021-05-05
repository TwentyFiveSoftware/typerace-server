import type { DefaultEventProps } from '../../types/DefaultEventProps';
import type { IGame } from './types/Game';
import type { IGameState } from './types/GameState';
import type { ILobby } from '../lobby/types/Lobby';
import { SocketResponseType } from '../../types/SocketResponseType';
import { getRandomText } from '../text/textManager';

const games: IGame[] = [];

const startGame = (props: DefaultEventProps, lobby: ILobby): void => {
    const game: IGame = {
        gameStartTime: Date.now(),
        started: true,
        isFinished: false,
        text: getRandomText(),
        lobby,
    };

    games.push(game);

    startGameUpdateLoop(props, game);
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

const restartGame = (props: DefaultEventProps, lobbyId: string): void => {
    const game = getGame(lobbyId);
    if (!lobbyId || !game || !game.isFinished) return;

    game.lobby.players.forEach(player => {
        player.isFinished = false;
        player.finishTime = 0;
        player.currentTextPosition = 0;
        player.typingSpeed = 0;
        player.playAgain = false;
    });

    game.isFinished = false;
    game.gameStartTime = Date.now();
    game.text = getRandomText();

    props.io.to(lobbyId).emit(SocketResponseType.GAME_RESTART);
    sendGameUpdate(props, game);
    startGameUpdateLoop(props, game);
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

export { getGame, startGame, getGameOfPlayer, sendGameUpdate, restartGame };
