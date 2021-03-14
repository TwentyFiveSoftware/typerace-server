export interface Player {
    socketId: string;
    username: string;
    isReady: boolean;
    isFinished: boolean;
    finishTime: number;

    currentTextPosition: number;
    typingSpeed: number;
}
