/// <reference path="../../creator.d.ts" />

const SendMessage = require ('sendMessage');
const ConnectToNetwork = require('connectToNetwork.js');
const BetStateManager = require('betStateManager')

cc.Class({
    extends: cc.Component,

    properties: {
        oddsItemPrefab: cc.Prefab,
        oddsItemLayout: cc.Node,
        oddsItemBackground: cc.Node,

        betPool: cc.Node,

        uiManager: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // cc.sys.localStorage.clear();
    },

    start () {
        this.uiManager = this.uiManager.getComponent('uiManager');
        this.betStateManager = new BetStateManager();
    },

    login(){
        this.connectToNetwork = new ConnectToNetwork();
        this.connectToNetwork.login(()=>{
            this.uiManager.loginFailed();
        })
    },

    joinGame(){
        this.sendMessage = new SendMessage();
        this.sendMessage.joinGame((data)=>{
            this.uiManager.setLabel('Joined Game');
            this.data = data;
        });
    },

    getODDs(){
        this.oddsData = this.betStateManager.getODDs(this.data)
        this.uiManager.setLabel(this.oddsData);
    },

    createOddsItem(){
        this.uiManager.closePopup();
        this.uiManager.activeButtonCreator(false);
        this.oddsData = (this.oddsData)? this.oddsData: this.betStateManager.getODDs(this.data);
        this.betStateManager.instantiateBet(this.oddsData, this.oddsItemPrefab, this.oddsItemLayout, this.oddsItemBackground);
    },

    bet(){
        this.betStateManager.bet(this.betPool, (payload)=>{
            this.sendMessage._executeCommand(payload, (dataResponse)=>{
                this.uiManager.openPopup();
                this.uiManager.setLabel(this.betStateManager.showResult(dataResponse.data));
            })
        })
    },
});
