import { gaGameCMD } from "./cc-arcade-base/Scripts/Network/gaCommandID";
import gaPromise from "./cc-arcade-base/Scripts/Utilities/gaPromise";
import { gameCommonUtils } from "./cc-arcade-base/Scripts/Definitions/gaCommon";
const appConfig = require('appConfig');
const network = require('game-network');
const { MessageManager, EventManager, CommandManager } = network;
const Network = require('network');
const messageManager = MessageManager.getInstance();
cc.Class({
    extends: cc.Component,
    ctor() {
        this.network = new Network();
        this._commandManager = new CommandManager('6995', 1, 'cId');
        this._eventManager = new EventManager(false, {
            'jgr': 'client-join-game-result',
            'sud': 'state-updated',
            'spu': 'state-pushed',
            'jud': 'jackpot-updated',
            'erp': 'error-pushed',
            'mep': 'message-pushed'
        });
    },

    joinGame(callback) {
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
            .waitUntil(() => this._latestRequest == null)
            .then(() => {
                this._latestRequest = promise;
                return this._executeCommand(payload, callback);
            })

    },

    _executeCommand(payload, callback) {
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
        const commandId = this._commandManager.executeCommand(payload, commandStrategy);
        if (payload.event == gaGameCMD.R_PLAY_GAME) {
            this._betCmdId = commandId;
        }

        if (!this._isSuccessSendCommandId(commandId)) {
            return;
        }

        const respId = gaGameCMD.responseOf(payload.event);

        if (!respId) {
            return resolve(commandId);
        }

        this._eventManager.waitForEvent(10000, (eventData) => {
            if (eventData.event === respId) {
                const data = eventData.data;
                if (data.cId == commandId) {
                    this.data = eventData;
                    callback(this.data);
                }
            }
        }, () => {
            cc.warn('timeOut');
        });
    },

    _isSuccessSendCommandId(commandId) {
        const overLimited = commandId === CommandManager.COMMAND_FAILED_CONC_OVER_LIMIT;
        const isDuplicated = commandId === CommandManager.COMMAND_FAILED_DUPLICATE;
        return commandId && !(overLimited && isDuplicated);
    },

    _onAck() {
        this._commandManager.onAck.apply(this._commandManager, arguments);
    },

    _onEvent(eventData) {
        this._eventManager.onEvent.apply(this._eventManager, arguments);
        const { event, data } = eventData;
    }
});
