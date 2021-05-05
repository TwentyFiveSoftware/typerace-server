export enum SocketResponseType {
    LOBBY_UPDATE = 'lobbyState',
    LOBBY_ERROR_INCORRECT_USERNAME = 'errorIncorrectUsername',
    LOBBY_ERROR_NOT_FOUND = 'errorLobbyNotFound',

    GAME_UPDATE = 'gameState',
    GAME_RESTART = 'restart',
}
