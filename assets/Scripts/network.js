import { gaSocketManager } from "./cc-arcade-base/Scripts/Network/gaSocketManager";

const globalNetwork = require('globalNetwork');
const appConfig = require('appConfig');

cc.Class({
    extends: cc.Component,

    login(callback) {
        let token = this.getToken();
        if (token != undefined) {
            globalNetwork.init(token, 'iframe', '6995');
            this.createSocket();
        }
        else {
            callback();
        }
    },

    getToken() {
        const TOKEN = appConfig.TOKEN;
        let token = '';
        if (TOKEN) {
            token = TOKEN;
        }
        else {
            token = this.getUrlParam('token');
        }
        if (!token) {
            token = cc.sys.localStorage.getItem('USER_TOKEN');
        }
        return token;
    },

    getUrlParam(name) {
        if (cc.sys.isNative) return null;
        const url = new URL(window.location);
        return url.searchParams.get(name);
    },

    createSocket() {
        this.socketManager = new gaSocketManager();
        this.socketManager.checkReady();
    },
});
