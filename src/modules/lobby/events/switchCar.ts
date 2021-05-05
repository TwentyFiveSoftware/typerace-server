import type { DefaultEventProps } from '../../../types/DefaultEventProps';
import { getLobbyIdOfPlayer, getPlayerOfSocket, sendLobbyUpdate } from '../lobbyManager';

const switchCarEvent = (props: DefaultEventProps, carIndex: number): void => {
    const { socket } = props;

    const player = getPlayerOfSocket(socket.id);
    if (!player) return;

    player.carIndex = carIndex;

    sendLobbyUpdate(props, getLobbyIdOfPlayer(socket.id));
};

export default switchCarEvent;
