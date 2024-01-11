import { gameCommonUtils, loadConfigAsync } from "../Definitions/gaCommon";
import gaDataFactory from "../Common/gaDataFactory";
import gaDataStore from "../Common/gaDataStore";
import gaEventEmitter from "../Common/gaEventEmitter";
import gaBaseConfig from "../Config/gaBaseConfig";
import logger from "../Utilities/gaLogger";
import gaPromise from "../Utilities/gaPromise";
import gaResultData from "./Data/gaResultData";
import gaRoundData from "./Data/gaRoundData";
import { gaGameCMD } from "./gaCommandID";
import gameService from "./gaGameService";
import { PayloadData } from "./gaISocketManager";
import { gaNetworkError } from "./gaNetworkError";
import { gaSocketManager } from "./gaSocketManager";
import gaEventsCode from "../Definitions/gaEventsCode";

export default class gaGameNetwork {
    //#region ------------------------------------------------------------------ Declare variables

    protected socketManager: gaSocketManager;
    protected isJoinedGame: boolean;
    protected lastGameState: null;
    protected gameChannel: string = '';

    protected static readonly STATE_NORMAL = 'NORMAL';
    protected static readonly STATE_DIE = 'DIE';

    protected _state: string;
    private _outGame: boolean = false;
    private _isWaitingBetData: boolean = false;

    constructor (protected gameId: string, protected version: string) {
        const { LOGIN_IFRAME } = loadConfigAsync.getConfig();
        gaBaseConfig.isIFrame = LOGIN_IFRAME;
    }

    public authenticate() {
        if (this._state == gaGameNetwork.STATE_DIE) return gaPromise.reject('STATE DIE');

        return gameService.authenticate(this.gameId, this.version)
            .then(() => this._createSocket())
            .catch((err) => {
                this._gotoDieMode();
                return gaPromise.reject(err);
            });
    }

    public joinGame(): gaPromise<void> {
        if (this._state == gaGameNetwork.STATE_DIE) return gaPromise.reject('STATE DIE');

        logger.debug('sendJoinGame --- ');
        this._reset();

        const { URL_CODE } = loadConfigAsync.getConfig();
        let code: any = '';
        let env = 3;

        if (gaBaseConfig.isIFrame) {
            code = gameCommonUtils.getUrlParam(URL_CODE);
            env = parseInt(gameCommonUtils.getUrlParam('env')) || 2;
        } else {
            env = cc.sys.isBrowser ? 1 : 3;
        }

        const payload = {
            event: gaGameCMD.R_JOIN_GAME,
            data: { code, env }
        };

        return this._sendMessage(payload).then((response: any) => this.updateJoinGameData(response));
    }

    public refreshWallet(): void {
        this.onWalletUpdate();
    }

    public refresh(): void {
        if (this._state == gaGameNetwork.STATE_DIE) return;
        if (this.socketManager.isReady()) {
            this._gotoNormalMode();
        }
    }

    public refreshPayout(payload: PayloadData): gaPromise<any> {
        if (this._state == gaGameNetwork.STATE_DIE) return gaPromise.reject('STATE DIE');

        return this._sendMessage(payload).then((resp) => this.onResponsePayout(resp));
    }

    public bet(payload: PayloadData): gaPromise<any> {
        if (this._state == gaGameNetwork.STATE_DIE) return gaPromise.reject('STATE DIE');

        this._isWaitingBetData = true;
        return this._sendMessage(payload).then((resp) => this.onResponseBet(resp)).finally(() => this._isWaitingBetData = false);
    }

    public onResponsePayout(resp: any): gaRoundData {
        const roundData = gaDataFactory.instance.create<gaRoundData>(gaRoundData, resp);
        gaDataStore.instance.setDataStore(roundData);
        return roundData;
    }

    public onResponseBet(resp: any): gaResultData {
        if (resp.jpup) {
            const arr = resp.jpup.split(',');
            arr.forEach((jpup: string) => {
                const jp = jpup.split(';');
                gaEventEmitter.instance.emit(gaEventsCode.JACKPOT.UPDATE_VALUE_JACKPOT, jp[0], parseFloat(jp[1]));
            });
        }
        const result = gaDataFactory.instance.create<gaResultData>(gaResultData, resp);
        gaDataStore.instance.result = result;
        return result;
    }

    public closeAndCleanUp() {
        this._reset();
        this.socketManager && this.socketManager.closeAndCleanUp();
    }

    public backToLogin() {
        this._outGame = true;
        this.closeAndCleanUp();
        gaEventEmitter.instance.emit(gaEventsCode.COMMON.REFRESH_PAGE);

        if (gaBaseConfig.isIFrame) {
            gameCommonUtils.handleCloseGameIframe();
        } else {
            gameCommonUtils.handleBackLogin();
        }
    }

    public leaveGame(): void {
        this._outGame = true;
        this.closeAndCleanUp();
        gaEventEmitter.instance.emit(gaEventsCode.COMMON.REFRESH_PAGE);

        if (gaBaseConfig.isIFrame) {
            gameCommonUtils.handleCloseGameIframe();
        } else {
            gameCommonUtils.handleFlowOutGame();
        }
    }

    private _createSocket(): void {
        if (!this.socketManager) {
            this.socketManager = new gaSocketManager(this.gameId, this.onErrorPushed.bind(this), this.onWalletUpdate.bind(this));
            this.socketManager.checkReady();
        }
    }

    protected _sendMessage(payload: any): gaPromise<any> {
        return this.socketManager
            .sendMessage(payload)
            .catch((err: gaNetworkError) => {
                if (!err.isResponseError && payload.event != gaGameCMD.R_JOIN_GAME) {
                    this.refresh();
                }
                return gaPromise.reject(err);
            });
    }

    private _reset(): void {
        this.isJoinedGame = false;
        this.lastGameState = null;
        this.socketManager && this.socketManager.clearPendingCommands();
        this.socketManager && this.socketManager.unSubscribe(this.gameChannel);
        this.socketManager && this.socketManager.unSubscribe(gaBaseConfig.NOTIFY_CHANNEL);
    }

    protected updateJoinGameData(resp: any): any {
        const { gCN, exD } = resp;
        this.gameChannel = gCN;

        if (exD.user) {
            gaDataStore.instance.userInfo.avatar = exD.user.av;
        }

        gaEventEmitter.instance.emit(gaEventsCode.POPUP.CLOSE_POPUP, {type: gaBaseConfig.POPUP_TYPE.DIALOG});
        const roundData = gaDataFactory.instance.create<gaRoundData>(gaRoundData, resp);
        gaDataStore.instance.setDataStore(roundData);

        if (this._state !== gaGameNetwork.STATE_DIE) this._gotoNormalMode();

        this.socketManager.subscribe(gCN);
        this.socketManager.subscribe(gaBaseConfig.NOTIFY_CHANNEL);

        const jp = resp.jp;
        if (jp) gaEventEmitter.instance.emit(gaEventsCode.JACKPOT.INIT_JACKPOT, ...jp);

        return roundData;
    }

    protected onWalletUpdate(): void {
        if (!this._isWaitingBetData && gaDataStore.instance.canUpdateWalletRealtime) {
            gaEventEmitter.instance.emit(gaEventsCode.USER.UPDATE_DATA);
        }
    }

    protected onErrorPushed(errorData: any): void {
        const { data } = errorData;
        if (Array.isArray(data) && data[0]) {
            const code = data[0].cd;
            let forceDie = false;
            //wallet error
            if (code[0] == 'W' || code == '0001' || code == '0006') { //wallet error
                gaEventEmitter.instance.emit(gaEventsCode.NETWORK.WALLET_ERROR, { forceDie, code, data });
            }
            else if (code == '0030' && this._state !== gaGameNetwork.STATE_DIE) { //server is inprogress
            }
            else if (code == '0031') {
            } else if (['0016', '0017'].indexOf(code) !== -1) { //promotion error
                gaEventEmitter.instance.emit(gaEventsCode.NETWORK.PROMOTION_ERROR, { forceDie, code, data });
            }
            else if (code == '0049') { // send bet error
                gaEventEmitter.instance.emit(gaEventsCode.NETWORK.REQUEST_BET_ERROR, { forceDie, code, data });
            }
            else { //backend error
                const forceDie = true;
                gaEventEmitter.instance.emit(gaEventsCode.NETWORK.BACKEND_ERROR, { forceDie, code, data });
                this._gotoDieMode();
            }
        }
    }

    private _gotoNormalMode(): void {
        if (this._outGame || this._state == gaGameNetwork.STATE_DIE) return;
        logger.debug('NORMAL MODE');
        this.refreshWallet();
        this._state = gaGameNetwork.STATE_NORMAL;
        this.socketManager.clearPendingCommands();
        gaEventEmitter.instance.emit(gaEventsCode.NETWORK.NORMAL);
    }

    private _gotoDieMode(): void {
        if (this._outGame || this._state == gaGameNetwork.STATE_DIE) return;
        logger.error('DIE MODE');
        this._state = gaGameNetwork.STATE_DIE;
        this.closeAndCleanUp();
        gaEventEmitter.instance.emit(gaEventsCode.NETWORK.WEB_SOCKET_FORCE_DISCONNECT);
    }
}
