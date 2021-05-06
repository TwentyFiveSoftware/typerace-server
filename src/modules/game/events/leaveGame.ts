import type { DefaultEventProps } from '../../../types/DefaultEventProps';
import { getGameOfPlayer, leaveGame, sendGameUpdate } from '../gameManager';

const leaveGameEvent = (props: DefaultEventProps): void => {
    const { socket } = props;

    const game = getGameOfPlayer(socket.id);
    if (!game) return;

    leaveGame(socket.id);
    sendGameUpdate(props, game);
};

export default leaveGameEvent;
