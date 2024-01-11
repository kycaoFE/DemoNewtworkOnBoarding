import gaEventsCode from "../Definitions/gaEventsCode";
import { gaGameText } from "../Definitions/gaGameText";
import gaGameNetwork from "../Network/gaGameNetwork";
import gaLogger from "../Utilities/gaLogger";
import gaComponent from '../Components/gaComponent';
import gaBaseConfig from "../Config/gaBaseConfig";
import gaDataStore from "./gaDataStore";
import gaLocalize from "./gaLocalize";
import gaLoadingScene from "../LoadingScene/gaLoadingScene";
import logger from "../Utilities/gaLogger";
import gaPromise from "../Utilities/gaPromise";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class gaMainController extends gaComponent {
    @property(cc.JsonAsset) private fileVersion: cc.JsonAsset = null;
    private _gameNetwork: gaGameNetwork = null;
    private _promiseBetting: gaPromise = null;
    private _isForceOut: boolean = false;
    private _isCleanned: boolean = false;

    protected onLoad(): void {
        super.onLoad();
        const version = this.fileVersion.json['version'];
        gaBaseConfig.gameVersion = version;
        gaDataStore.instance.initialize();
    }

    protected start(): void {
        this._gameNetwork = this.createGameNetwork();
        this._gameNetwork.authenticate()
            .then(this.onAuthenSuccess.bind(this))
            .catch(this.onAuthenFail.bind(this));
    }

    protected onDestroy(): void {
        super.onDestroy();
        this._cleanUp();
    }

    protected abstract createGameNetwork(): gaGameNetwork;

    protected initEvents(): void {
        this.register(gaEventsCode.ACTION.BET, this.requestBet);
        this.register(gaEventsCode.ACTION.REFRESH_PAYOUT, this.requestRefreshPayout);
        this.register(gaEventsCode.ACTION.LEAVE_GAME, this.leaveGame);
        this.register(gaEventsCode.ACTION.CLEAR_USER_BETTING, this.clearUserBetting);

        this.register(gaEventsCode.BET.NOT_ENOUGH_MONEY, this.onNotEnoughMoney);
        this.register(gaEventsCode.BET.REACH_MAX_BET, this.onReachMaxBet);
        this.register(gaEventsCode.BET.CHANGE_BET_VALUE, this.onChangeBetValue);

        this.register(gaEventsCode.NETWORK.WEB_SOCKET_OPEN, this.onWsOpen);
        this.register(gaEventsCode.NETWORK.WEB_SOCKET_CLOSE, this.onWsClose);
        this.register(gaEventsCode.NETWORK.CANNOT_AUTHEN, this.onAuthenFail);
        this.register(gaEventsCode.NETWORK.WEB_SOCKET_RECONNECT, this.onReconnect);
        this.register(gaEventsCode.NETWORK.WEB_SOCKET_FORCE_DISCONNECT, this.onForceDisconnect);
        this.register(gaEventsCode.NETWORK.WEB_SOCKET_DISCONNECT, this.onDisconnect);
        this.register(gaEventsCode.NETWORK.WEB_SOCKET_TEMP_DISCONNECT, this.onDisconnect);

        this.register(gaEventsCode.NETWORK.BACKEND_ERROR, this.onBackendError);
        this.register(gaEventsCode.NETWORK.PROMOTION_ERROR, this.onPromotionError);
        this.register(gaEventsCode.NETWORK.WALLET_ERROR, this.onWalletError);
        this.register(gaEventsCode.NETWORK.NORMAL, this.onNetworkNormal);

        this.register(gaEventsCode.DATA.EMPTY, this.onDataEmpty);

        cc.game.on(cc.game.EVENT_SHOW, this.onShowGame, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onHideGame, this);
    }

    removeEvents(): void {
        super.removeEvents();
        cc.game.off(cc.game.EVENT_SHOW, this.onShowGame);
        cc.game.off(cc.game.EVENT_HIDE, this.onHideGame);
    }

    protected onShowGame(): void {
        this.emit(gaEventsCode.COMMON.GAME_SHOW);
    }

    protected onHideGame(): void {
        this.emit(gaEventsCode.COMMON.GAME_HIDE);
    }

    protected leaveGame(): void {
        this._gameNetwork.leaveGame();
    }

    protected clearUserBetting(): void {
        if (this._promiseBetting) {
            this._promiseBetting.cancel();
            this._promiseBetting = null;
        }
    }

    protected requestBet(bets?: any): void {
        this.clearUserBetting();
        this._promiseBetting = this._gameNetwork.bet(bets);
        this._promiseBetting.then(result => {
                gaDataStore.instance.userInfo.setPending(result.totalWinAmount);
                this.emit(gaEventsCode.JACKPOT.PAUSE_JACKPOT);
                this.emit(gaEventsCode.DATA.RESULT_RECEIVED, result);
            })
            .catch((err) => {
                logger.error("Request play failed", err);
                this.emit(gaEventsCode.DATA.RESULT_RECEIVED, null, err);
            });
    }

    protected requestRefreshPayout(data?: any): void {
        this._gameNetwork.refreshPayout(data)
            .then(payout => {
                this.emit(gaEventsCode.DATA.PAYOUT_RECEIVED, payout);
            })
            .catch((err) => {
                logger.error("Refresh payout failed", err);
                this.emit(gaEventsCode.DATA.PAYOUT_RECEIVED, null, err);
            });
    }

    protected onInitGame(): void {
        gaLogger.warn('onInitGame');
        this.emit(gaEventsCode.COMMON.INITIALIZE_GAME);
    }

    private _cleanUp(): void {
        if (this._isCleanned) return;
        this._isCleanned = true;
        this.removeEvents();
        this._gameNetwork && this._gameNetwork.closeAndCleanUp();
        gaDataStore.instance.cleanUp();
    }

    protected onWsOpen(): void {
        this._gameNetwork.joinGame()
            .then(() => this.onInitGame())
            .catch(this.onJoinGameFailed.bind(this))
            .finally(() => this.hideLoadingScene());
    }

    protected onWsClose(data): void {
        const message = gaLocalize.instance.DISCONNECT;
        const onConfirm = () => this._gameNetwork.leaveGame();
        this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm, type: gaBaseConfig.instance.POPUP_PROMPT.SOCKET_DISCONNECT });
    }

    protected onJoinGameFailed(err: any): void {
        gaLogger.error("Join Game Failed", err);
        const message = gaLocalize.instance.AUTHEN_FAILED;
        const onConfirm = () => this._gameNetwork.leaveGame();
        this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm, type: gaBaseConfig.instance.POPUP_PROMPT.ERROR_NETWORK });
        this._gameNetwork.closeAndCleanUp();
        this.hideLoadingScene();
    }

    protected onReconnect(): void {
        if (!this._isForceOut) {
            this._gameNetwork.joinGame()
                .then(() => {
                    this.hideLoadingScene();
                })
                .catch(this.onJoinGameFailed.bind(this))
                .finally(() => {
                });
        }
    }

    protected onDisconnect(): void {
        const message = gaLocalize.instance.DISCONNECT;
        const onConfirm = () => this._gameNetwork.leaveGame();
        this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm, type: gaBaseConfig.instance.POPUP_PROMPT.SOCKET_DISCONNECT });
    }

    protected onForceDisconnect(message: string): void {
        this._isForceOut = true;
        this._cleanUp();
        if (message) {
            const onConfirm = () => this._gameNetwork.backToLogin();
            this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm, type: gaBaseConfig.instance.POPUP_PROMPT.ERROR_NETWORK });
        }
    }

    protected onBackendError(data: { forceDie: boolean, code: string, data: any }): void {
        gaLogger.error("Backend error", data.data);
        const message = gaGameText.getErrorMessage(data.code);
        if (data.forceDie) {
            this._isForceOut = true;
            this._cleanUp();
            const onConfirm = () => this._gameNetwork.leaveGame();
            this.hideLoadingScene();
            this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm, type: gaBaseConfig.instance.POPUP_PROMPT.ERROR_NETWORK });
        }
    }

    protected onPromotionError(data: { code: string, data: any }): void {
        gaLogger.error("Promotion error", data.data);
        const message = gaGameText.getErrorMessage(data.code);
        const onConfirm = () => this._gameNetwork.refresh();
        this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm, type: gaBaseConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON});
    }

    protected onWalletError(data: { code: string, data: any }): void {
        gaLogger.error("Wallet error", data.data);
        const message = gaGameText.getErrorMessage(data.code);
        const onConfirm = () => this._gameNetwork.refresh();
        this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm, type: gaBaseConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON});
    }

    protected onNetworkNormal(): void {

    }

    protected onDataEmpty(): void {
        const message = gaLocalize.instance.EMPTY_LEADER_BOARD;
        this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, type: gaBaseConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON });
    }

    protected onAuthenSuccess(): void {
    }

    protected onAuthenFail(err: any): void {
        gaLogger.error("Authentication failed", err);
        const message = gaLocalize.instance.AUTHEN_FAILED;
        const onConfirm = () => this._gameNetwork.backToLogin();
        this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm, type: gaBaseConfig.instance.POPUP_PROMPT.ERROR_NETWORK});
        this.hideLoadingScene();
    }

    protected onNotEnoughMoney(callback?: Function): void {
        const message = gaLocalize.instance.NO_MONEY;
        this.emit(gaEventsCode.POPUP.SHOW_DIALOG, { message, onConfirm: callback, type: gaBaseConfig.instance.POPUP_PROMPT.JUST_CONFIRM_BUTTON });
    }

    protected onReachMaxBet(): void {
        const message = gaLocalize.instance.OVER_MAX_BET;
        this.emit(gaEventsCode.POPUP.SHOW_TOAST, { message, duration: 1 });
    }

    protected onChangeBetValue(betValue: number) {
        gaDataStore.instance.betValue = betValue;
    }

    protected hideLoadingScene(): void {
        if (gaLoadingScene.instance) {
            gaLoadingScene.instance.hide();
        }
    }
}
