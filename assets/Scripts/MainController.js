/// <reference path="../../creator.d.ts" />

import Data from "./data";

const SendMessage = require('sendMessage');
const Network = require('network');
const BetStateManager = require('betStateManager')

cc.Class({
    extends: cc.Component,

    properties: {
        oddsItemPrefab: cc.Prefab,
        betBackgroundPools: [cc.Node],

        betPools: [cc.Node],

        uiManager: cc.Node,
    },

    onLoad() {
        Data.instance = new Data();
    },

    start() {
        this.uiManager = this.uiManager.getComponent('uiManager');
        this.sendMessage = new SendMessage();
        this.betStateManager = new BetStateManager();
        this.network = new Network();
    },

    login() {
        this.network.login(() => {
            this.uiManager.loginFailed();
        })
    },

    joinGame() {
        this.sendMessage.joinGame((dataResponse) => {
            this.uiManager.setLabel('Joined Game');
            this.data = dataResponse;
            Data.instance.setGameNumber(dataResponse.data.exD.ed.split(':')[1])
        });
    },

    getODDs() {
        this.oddsData = this.betStateManager.getODDs(this.data)
        this.uiManager.setLabel(this.oddsData);
    },

    createOddsItem() {
        this.uiManager.closePopup();
        this.uiManager.activeButtonCreator(false);
        this.oddsData = (this.oddsData) ? this.oddsData : this.betStateManager.getODDs(this.data);
        this.betStateManager.instantiateBet(this.oddsData, this.oddsItemPrefab, this.betPools, this.betBackgroundPools);
    },

    bet() {
        const payload = this.betStateManager.bet(this.betPools);
        this.sendMessage._executeCommand(payload, (dataResponse) => {
            Data.instance.dataRoundCurrent = (dataResponse.event == 'n') ? dataResponse : null;
            if (Data.instance.dataRoundCurrent) {
                this.uiManager.openPopup();
                this.uiManager.setLabel(this.betStateManager.showResult());
            }
        })
    },
});
