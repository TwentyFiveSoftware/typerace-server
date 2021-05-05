import { DefaultEventProps } from '../../../types/DefaultEventProps';
import { getGameOfPlayer, restartGame, sendGameUpdate } from '../gameManager';
import { getPlayerOfSocket } from '../../lobby/lobbyManager';

const togglePlayAgainEvent = (props: DefaultEventProps): void => {
    const { socket } = props;

    const game = getGameOfPlayer(socket.id);
    if (!game || !game.isFinished) return;

    const player = getPlayerOfSocket(socket.id);
    if (!player || !player.isFinished) return;

    player.playAgain = !player.playAgain;

    sendGameUpdate(props, game);

    if (!game.lobby.players.some(player => !player.playAgain)) {
        restartGame(props, game.lobby.lobbyId);
    }
};

export default togglePlayAgainEvent;
