import { gaDemoPlayer } from "../Definitions/gaDemoPlayer";
import gaEventsCode from "../Definitions/gaEventsCode";
import gaUserInfo from "../Definitions/gaUserInfo";
import gaEventEmitter from "./gaEventEmitter";
import gaResultData from '../Network/Data/gaResultData';

export default class gaDataStore {
    public static instance: gaDataStore = null;

    canUpdateWalletRealtime: boolean = true;
    isTutorial: boolean = false;
    userInfo: gaUserInfo;
    betValue: number = 0;
    isUserPlaceAnyBet: boolean = false;
    oddsConfigs: Record<string, number> = {};
    maxBetConfigs: Record<string, number> = {};
    betting: Record<string, number> = {};
    denoms: Record<string, number> = {};
    currDenomId: string = "10";
    gameNumber: string = "";
    userActive: number = 0;
    sessionId: string = "";
    result: gaResultData = null;
    get totalBet(): number {
        let total = 0;
        for (const key in this.betting) {
            total += this.betting[key];
        }
        return total;
    }

    typeOfCurrency = "VND";
    currencyRatio = 1;
    jackpotInfo = [];

    initialize() {
        this.isTutorial = false;
        this.userInfo = new gaUserInfo();
        gaEventEmitter.instance.emit(gaEventsCode.USER.UPDATE_DATA);
    }

    demo() {
        this.isTutorial = true;
        this.userInfo = new gaDemoPlayer();
        gaEventEmitter.instance.emit(gaEventsCode.USER.UPDATE_DATA);
    }

    destroy() {
        gaDataStore.instance = null;
    }

    getUserTypeOfCurrency() {
        return this.typeOfCurrency;
    }

    getCurrencyRatio() {
        return this.currencyRatio;
    }

    getMaxBet(betId: string): number {
        return this.maxBetConfigs[betId];
    }

    getOdds(betId: string): number {
        return this.oddsConfigs[betId];
    }

    setCurrencyConfig(data) {
        if (data.TypeOfCurrency) {
            this.typeOfCurrency = data.TypeOfCurrency;
        }

        if (data.CurrencyRatio) {
            this.currencyRatio = data.CurrencyRatio;
        }

        if (data.JackpotInfo && data.JackpotInfo.length > 0) {
            this.jackpotInfo = data.JackpotInfo;
        }
    }

    setDataStore(data: Object) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)
                && Object.prototype.hasOwnProperty.call(this, key)) {
                    this[key] = data[key];
            }
        }
    }

    cleanUp() {
        this.isUserPlaceAnyBet = false;
        this.betting = {};
    }
}
