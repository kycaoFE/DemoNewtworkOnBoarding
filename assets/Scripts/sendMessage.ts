import { gaGameCMD } from "./cc-arcade-base/Scripts/Network/gaCommandID";
import gaPromise from "./cc-arcade-base/Scripts/Utilities/gaPromise";
import { gameCommonUtils } from "./cc-arcade-base/Scripts/Definitions/gaCommon";
import Network from './network';
const appConfig = require('appConfig');
const network = require('game-network');
const { MessageManager, EventManager, CommandManager } = network;
const messageManager = MessageManager.getInstance();

export default class SendMessage {
    private network: any;
    private commandManager: any;
    private eventManager: any;
    private latestRequest: any = null;

    constructor() {
        this.network = new Network();
        this.commandManager = new CommandManager('6995', 1, 'cId');
        this.eventManager = new EventManager(false, {
            'jgr': 'client-join-game-result',
            'sud': 'state-updated',
            'spu': 'state-pushed',
            'jud': 'jackpot-updated',
            'erp': 'error-pushed',
            'mep': 'message-pushed'
        });
    }

    joinGame(callback: Function) {
        const URL_CODE = appConfig.URL_CODE;
        let code = '';
        let env = 3;

        code = gameCommonUtils.getUrlParam(URL_CODE);
        env = parseInt(gameCommonUtils.getUrlParam('env')) || 2;

        const payload = {
            event: gaGameCMD.R_JOIN_GAME,
            data: { code, env }
        };
        messageManager.registerGame('6995', {
            onAck: this._onAck.bind(this),
        }, {
            onEvent: this._onEvent.bind(this)
        });
        const promise = gaPromise.resolve()
            .waitUntil(() => this.latestRequest == null)
            .then(() => {
                this.latestRequest = promise;
                return this._executeCommand(payload, callback);
            })
    }

    _executeCommand(payload: any, callback: Function) {
        payload.data = payload.data || {};
        payload.data.tkn = this.network.getToken();
        payload.data.sId = '6995';

        const commandStrategy = {
            resendCount: 100,
            shouldWaitForACK: true,
            canBeDuplicated: false,
        };
        if (payload.retry === false) {
            commandStrategy.resendCount = 0;
        }
        const commandId = this.commandManager.executeCommand(payload, commandStrategy);

        if (!this._isSuccessSendCommandId(commandId)) {
            return;
        }

        const respId = gaGameCMD.responseOf(payload.event);

        if (!respId) {
            return;
        }

        this.eventManager.waitForEvent(10000, (eventData) => {
            if (eventData.event === respId) {
                const data = eventData.data;
                if (data.cId == commandId) {
                    callback(eventData);
                }
            }
        }, () => {
            cc.warn('timeOut');
        });
    }

    _isSuccessSendCommandId(commandId: any) {
        const overLimited = commandId === CommandManager.COMMAND_FAILED_CONC_OVER_LIMIT;
        const isDuplicated = commandId === CommandManager.COMMAND_FAILED_DUPLICATE;
        return commandId && !(overLimited && isDuplicated);
    }

    _onAck() {
        this.commandManager.onAck.apply(this.commandManager, arguments);
    }

    _onEvent(eventData: any) {
        this.eventManager.onEvent.apply(this.eventManager, arguments);
        cc.warn(eventData);
    }
}
