import gaPromise from "../Utilities/gaPromise";

export type CommandStrategy = { resendCount: number, shouldWaitForACK: boolean, canBeDuplicated: boolean };
export type PayloadData = { event: string; data?: any; version?: string, retry?: boolean };

export interface gaISocketManager {
    isReady(): boolean;
    checkReady(): void;
    subscribe(channel: string): void;
    unSubscribe(channel: string): void;
    sendMessage(payload: PayloadData): gaPromise<any>;
    closeAndCleanUp(): void;
    clearPendingCommands(): void;
}
