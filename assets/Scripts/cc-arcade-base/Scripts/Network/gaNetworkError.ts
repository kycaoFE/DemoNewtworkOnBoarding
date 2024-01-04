export class gaNetworkError extends Error {
    public isDisconnected: boolean = false;
    public isExecuteCommandFailure: boolean = false;
    public isTimeout: boolean = false;
    public isResponseError: boolean = false;

    static timeout(message: string) {
        const error = new gaNetworkError(message);
        error.isTimeout = true;
        return error;
    }

    static disconnected(message: string) {
        const error = new gaNetworkError(message);
        error.isDisconnected = true;
        return error;
    }

    static excecuteFail(message: string) {
        const error = new gaNetworkError(message);
        error.isExecuteCommandFailure = true;
        return error;
    }

    static responseError(message: string) {
        const error = new gaNetworkError(message);
        error.isResponseError = true;
        return error;
    }
}
