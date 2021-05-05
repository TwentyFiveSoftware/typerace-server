import type { DefaultEventProps } from '../../../types/DefaultEventProps';
import { getLobbyIdOfPlayer, leaveLobby, sendLobbyUpdate } from '../lobbyManager';

const leaveLobbyEvent = (props: DefaultEventProps): void => {
    const { socket } = props;

    const lobbyId = getLobbyIdOfPlayer(socket.id);
    if (!lobbyId) return;

    leaveLobby(lobbyId, socket.id);
    sendLobbyUpdate(props, lobbyId);
};

export default leaveLobbyEvent;
