import { IPlayer } from './Player';

export interface ILobby {
    lobbyId: string;
    players: IPlayer[];
}
