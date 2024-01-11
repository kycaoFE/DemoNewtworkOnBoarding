import gaPromise from "../Utilities/gaPromise";
import { CommandStrategy, PayloadData, gaISocketManager } from "./gaISocketManager";
import { connectNetwork, network } from '../Definitions/gaCommon';
import gaEventCode from "../Definitions/gaEventsCode";
import gaLocalize from "../Common/gaLocalize";
import { gaGameCMD } from './gaCommandID';
import { gaNetworkError } from './gaNetworkError';
import gaEventEmitter from '../Common/gaEventEmitter'
import gaBaseConfig from "../Config/gaBaseConfig";
import logger from "../Utilities/gaLogger";
// import { instantiate } from '../../../../../creator';

const { MessageManager, CommandManager, EventManager, PlayerInfoStateManager, SocketManager } = network;
const messageManager = MessageManager.getInstance();
const playerInfoStateManager = PlayerInfoStateManager.getInstance();


enum NetworkStatus {
    Initialized,
    CanNotAuthenticate,
    Connected,
    Reconnecting,
    Disconnected,
}

export class gaSocketManager implements gaISocketManager {

    private _commandManager: any;
    private _eventManager: any;
    private _networkStatus: NetworkStatus;
    private _messageDisconnected = '';
    private _handleUserLogout: Function;
    private _handleWalletUpdated: Function;
    private _handleErrorPushed: Function;
    private _firstInitSocket = true;
    private _gameId: string;
    private _betCmdId: string;
    private _latestRequest: gaPromise;

    constructor () {
        logger.warn("gaSocketManager created");
        // this._gameId = gameId;;
        this._networkStatus = NetworkStatus.Initialized;
        this._handleUserLogout = () => {
            this._networkStatus = NetworkStatus.Disconnected;
            gaBaseConfig.isLoginOnOtherDevice = true;
            this._messageDisconnected = gaLocalize.instance.ANOTHER_ACCOUNT;
            this._onForceDisconnect(this._messageDisconnected);
        }
        // this._handleWalletUpdated = () => onWalletUpdated();
        // this._handleErrorPushed = (errorData: any) => onErrorPushed(errorData);
        this._commandManager = new CommandManager(this._gameId, 1, 'cId');
        this._eventManager = new EventManager(false, {
            'jgr': 'client-join-game-result',
            'sud': 'state-updated',
            'spu': 'state-pushed',
            'jud': 'jackpot-updated',
            'erp': 'error-pushed',
            'mep': 'message-pushed'
        });

        messageManager.registerGame(this._gameId, {
            onAck: this._onAck.bind(this),
            onCannotSendMessage: this._onCannotSendMessage.bind(this)
        }, {
            onConnected: this._onConnected.bind(this),
            onCannotConnect: this._onDisconnect.bind(this),
            onCannotAuthen: this._onCannotAuthen.bind(this),
            onNetworkStatus: this._onNetworkStatus.bind(this),
            onNetworkWarning: this._onNetworkWarning.bind(this),
            onShowPopupDisconnected: this._onShowPopupDisconnected.bind(this),
            onEvent: this._onEvent.bind(this)
        });

        // playerInfoStateManager.registerEventOnce('user-logged-out', this._handleUserLogout);
        // playerInfoStateManager.registerEvent('wallet-updated', this._handleWalletUpdated);
    }

    public isReady(): boolean {
        return messageManager._socketManager && messageManager._socketManager.isAbleSendingData();
    }
    public checkReady(): void {
        if (this.isReady() && this._networkStatus == NetworkStatus.Initialized) this._onConnected();
    }
    public subscribe(channel: string): void {
        this._commandManager.subscribe(channel);
    }
    public unSubscribe(channel: string): void {
        this._commandManager.unSubscribe(channel);
    }
    public sendMessage(payload: PayloadData): gaPromise<any> {
        const promise = gaPromise.resolve()
            .waitUntil(() => this._latestRequest == null)
            .then(() => {
                this._latestRequest = promise;
                return this._executeCommand(payload);
            })
            .then((response) => {
                this._latestRequest = null;
                return gaPromise.resolve(response);
            });

        return promise;
    }
    public closeAndCleanUp(): void {
        this.clearPendingCommands();

        this._commandManager && this._commandManager.cleanUp();
        this._eventManager && this._eventManager.cleanUp();

        playerInfoStateManager.removeEvent('user-logged-out', this._handleUserLogout);
        playerInfoStateManager.removeEvent('wallet-updated', this._handleUserLogout);

        messageManager && messageManager.unregisterGame(this._gameId);
        if (gaBaseConfig.isIFrame) {
            messageManager && messageManager.closeAndCleanUp();
        }
    }
    public clearPendingCommands(): void {
        this._eventManager.removeAllEventListeners();
        this._eventManager.removeWaitingQueue();
        this._commandManager.clearRemainingCommand();
        this._latestRequest && this._latestRequest.cancel();
        this._latestRequest = null;
    }

    private _executeCommand(payload: any): gaPromise<any> {
        return new gaPromise<any>((resolve, reject) => {
            switch (this._networkStatus) {
                case NetworkStatus.CanNotAuthenticate:
                case NetworkStatus.Disconnected:
                case NetworkStatus.Reconnecting:
                    return reject(gaNetworkError.disconnected('Network is unavailable'));
            }

            payload.data = payload.data || {};
            payload.data.tkn = playerInfoStateManager.getToken() || connectNetwork.getToken();
            payload.data.sId = payload.data.serviceId || this._gameId;

            const commandStrategy = this._buildCommandStrategy(payload.event);
            if (payload.retry === false) {
                commandStrategy.resendCount = 0;
            }
            const commandId = this._commandManager.executeCommand(payload, commandStrategy);

            if (payload.event == gaGameCMD.R_PLAY_GAME) {
                this._betCmdId = commandId;
            }

            if (!this._isSuccessSendCommandId(commandId)) {
                return reject(gaNetworkError.excecuteFail(`Send command fail: event = ${payload.event}, commandId = ${commandId}`));
            }

            const respId = gaGameCMD.responseOf(payload.event);
            if (!respId) {
                return resolve(commandId);
            }

            let eventStrategy = this._buildEventStrategy(payload.event);
            this._eventManager.waitForEvent(eventStrategy.timeWaitForEvent, (eventData: any) => {
                let isCorrect = false;
                if (eventData.event === respId) {
                    let data = eventData.data;
                    if (data.cId == commandId) {
                        resolve(eventData.data);
                        isCorrect = true;
                    }
                } else if (eventData.event === gaGameCMD.ERROR_PUSH) {
                    const { data } = eventData;
                    if (Array.isArray(data) && data[0] && data[0].cId == commandId) {
                        reject(gaNetworkError.responseError(eventData));
                        isCorrect = true;
                    }
                }
                return isCorrect;
            }, () => {
                reject(gaNetworkError.timeout(`Request timeout:\n\t- Wait for event: ${respId}\n\t- Payload: ${JSON.stringify(payload)}`));
            });
        })
    }
    private _isSuccessSendCommandId(commandId: string): boolean {
        const overLimited  = commandId === CommandManager.COMMAND_FAILED_CONC_OVER_LIMIT;
        const isDuplicated = commandId === CommandManager.COMMAND_FAILED_DUPLICATE;
        return commandId && !(overLimited && isDuplicated);
    }
    private _buildEventStrategy(commandType: string) {
        if (commandType == 'glt') {
            return { timeWaitForEvent: 5000 };
        }
        return { timeWaitForEvent: 10000 };
    }
    private _buildCommandStrategy(event: string): CommandStrategy {
        let command: CommandStrategy;
        switch (event) {
            case 'player-active':
                command = {
                    resendCount: 0,
                    shouldWaitForACK: false,
                    canBeDuplicated: true
                };
                break;
            case 'jg':
                command = {
                    resendCount: 100,
                    shouldWaitForACK: true,
                    canBeDuplicated: false,
                };
                break;
            default:
                command = {
                    resendCount: 3,
                    shouldWaitForACK: true,
                    canBeDuplicated: false
                };
                break;
        }
        return command;
    }
    private _onAck(): void {
        this._commandManager.onAck.apply(this._commandManager, arguments);
    }
    private _onCannotSendMessage(): void {
        logger.warn("onCannotSendMessage");
        this._commandManager.onCannotSendMessage.apply(this._commandManager, arguments);
    }
    private _onConnected(): void {
        logger.warn("onConnected");
    if (this._networkStatus == NetworkStatus.CanNotAuthenticate) return;
        if (playerInfoStateManager && playerInfoStateManager.userId != null) {
            this._networkStatus = NetworkStatus.Connected;
            // this._handleWalletUpdated();
        }

        this._eventManager.onConnected();

        if (this._firstInitSocket) {
            this._firstInitSocket = false;
            gaEventEmitter.instance.emit(gaEventCode.NETWORK.WEB_SOCKET_OPEN);
            return 
        } else {
            gaEventEmitter.instance.emit(gaEventCode.NETWORK.WEB_SOCKET_RECONNECT);
        }

        this._commandManager.clearRemainingCommand();
    }
    private _onCannotAuthen(): void {
        logger.error("onCannotAuthen");
        this._networkStatus = NetworkStatus.CanNotAuthenticate;
        gaEventEmitter.instance.emit(gaEventCode.NETWORK.CANNOT_AUTHEN);
        this.closeAndCleanUp();
    }
    private _onDisconnect(): void {
        logger.error("onDisconnect");
        if (this._networkStatus == NetworkStatus.Initialized) return;
        let isReconnecting = this._networkStatus == NetworkStatus.Reconnecting;
        this._networkStatus = NetworkStatus.Disconnected;
        this.clearPendingCommands();
        gaEventEmitter.instance.emit(gaEventCode.NETWORK.WEB_SOCKET_DISCONNECT);
        gaEventEmitter.instance.emit(gaEventCode.NETWORK.WEB_SOCKET_CLOSE, { isReconnectFailed: isReconnecting });
    }
    private _onNetworkStatus(status: any): void {
        logger.warn("onNetworkStatus", status);
        switch (status) {
            case SocketManager.POOR_CONNECTION:
                this._networkStatus = NetworkStatus.Reconnecting;
                gaEventEmitter.instance.emit(gaEventCode.NETWORK.WEB_SOCKET_TEMP_DISCONNECT);
                break;
        }
    }
    private _onNetworkWarning(status: any): void {
        logger.warn("onNetworkWarning", status);
        this._networkStatus = NetworkStatus.Reconnecting;
        this.clearPendingCommands();
        switch (status) {
            case SocketManager.DISCONNECTED_CONNECTION:
                this._networkStatus = NetworkStatus.Reconnecting;
                gaEventEmitter.instance.emit(gaEventCode.NETWORK.WEB_SOCKET_BAD_CONDITION);
                break;
        }
    }
    private _onForceDisconnect(message: any): void {
        logger.error("onForceDisconnect");
        this._networkStatus = NetworkStatus.Disconnected;
        this.clearPendingCommands();
        this._messageDisconnected = message;
        gaEventEmitter.instance.emit(gaEventCode.NETWORK.WEB_SOCKET_FORCE_DISCONNECT, message);
    }
    private _onShowPopupDisconnected(): void {
        logger.error("onShowPopupDisconnected");
        this._networkStatus = NetworkStatus.Disconnected;
        this.clearPendingCommands();
        gaEventEmitter.instance.emit(gaEventCode.NETWORK.WEB_SOCKET_DISCONNECT);
    }
    private _onEvent(eventData: { event: any; data: any; }): void {
        this._eventManager.onEvent.apply(this._eventManager, arguments);
        const { event, data } = eventData;
        logger.debug("onEvent", eventData);
        switch (event) {
            case gaGameCMD.ERROR_PUSH:
                this._handleErrorPushed(eventData);
                break;

            case gaGameCMD.JACKPOT_UPDATE:
                gaEventEmitter.instance.emit(gaEventCode.JACKPOT.UPDATE_JACKPOT, data);
                break;

            case gaGameCMD.JACKPOT_WIN:
                if (this._betCmdId == data.jpInfo[0].cmdId) {
                    gaEventEmitter.instance.emit(gaEventCode.JACKPOT.UPDATE_VALUE_JACKPOT, data.jpInfo[0].jpId, data.jpInfo[0].amt);
                }
                break;

            case gaGameCMD.ON_NOTIFY:
                gaEventEmitter.instance.emit(gaEventCode.NOTIFY.SHOW_NOTIFY, data);
                break;
        }
    }

}
