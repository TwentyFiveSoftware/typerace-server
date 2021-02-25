export interface Player {
    socketId: string;
    username: string;
    isReady: boolean;

    currentTextPosition: number;
    typingSpeed: number;
}
