import { connectNetwork, globalNetwork, loadConfigAsync, serviceRest } from "../../Scripts/Definitions/gaCommon";
import logger from "../Utilities/gaLogger";
import gaPromise from "../Utilities/gaPromise";
const Sentry = (window as any).Sentry;

class gaGameService {
    private _gameId: string = '';

    public authenticate(gameId: string, version: string): gaPromise<void> {
        logger.debug("authenticate", gameId, version);
        this._gameId = gameId;
        return this._login(gameId)
            .then(() => this._register(gameId, version));
    }

    private _login(gameId: string): gaPromise<void> {
        return new gaPromise((resolve, reject) => {
            connectNetwork.loginScene({
                gameId,
                callback: resolve,
                callbackAuthFailed: () => {
                    logger.error("Login failed");
                    reject();
                }
            });
        });
    }

    private _register(gameId: string, version: string): gaPromise<void> {
        return new gaPromise<void>((resolve) => {
            if (typeof Sentry !== 'undefined') {
                Sentry.configureScope((scope: any) => {
                    scope.setExtra("gameId", gameId);
                    scope.setExtra("version", version);
                });
            }

            resolve();
        })
    }

    public getHistory(uPath: string, requestParams: any): Promise<any> {
        const headers = {
            Authorization: globalNetwork.getToken(),
        };
        const apiUrl = loadConfigAsync.getConfig().API_URL;

        return new Promise<any>((resolve, reject) => {
            serviceRest.getWithHeader({
                url: uPath,
                apiUrl,
                params: requestParams,
                headers,
                callback: (res: any) => {
                    if (this._checkInvalidResponse(res)) {
                        reject();
                        return;
                    }

                    resolve(res);
                },
                callbackErr: reject
            })
        });
    }

    private _checkInvalidResponse(res: any): boolean {
        return !res || res.status == 'FAIL' || res.data == null;
    }
}

const gameService = new gaGameService();
export default gameService;
