export interface Player {
    socketId: string;
    username: string;
    isReady: boolean;
    isFinished: boolean;

    currentTextPosition: number;
    typingSpeed: number;
}
