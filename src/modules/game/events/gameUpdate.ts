import { DefaultEventProps } from '../../../types/DefaultEventProps';
import { getGameOfPlayer, sendGameUpdate } from '../gameManager';
import { getPlayerOfSocket } from '../../lobby/lobbyManager';

const gameUpdateEvent = (props: DefaultEventProps, currentTextPos: number): void => {
    const { socket } = props;

    const game = getGameOfPlayer(socket.id);
    if (!game || !game.started || game.isFinished) return;

    const player = getPlayerOfSocket(socket.id);
    if (!player || player.isFinished) return;

    if (currentTextPos === game.text.length) {
        player.isFinished = true;
        player.finishTime = Date.now();
    }

    player.currentTextPosition = currentTextPos;

    sendGameUpdate(props, game);
};

export default gameUpdateEvent;
