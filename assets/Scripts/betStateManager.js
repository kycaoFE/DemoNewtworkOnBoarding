import { gaGameCMD } from "./cc-arcade-base/Scripts/Network/gaCommandID";
import Data from "./data";
cc.Class({
    extends: cc.Component,

    properties: {
        red: new cc.Color(255, 0, 0),
        green: new cc.Color(0, 255, 0),
        yellow: new cc.Color(255, 255, 0)
    },

    getODDs(dataResponse) {
        const oddsTemp = dataResponse.data.exD.ed.split("#");
        const odds = oddsTemp[3];
        const oddItems = odds.split(',');
        return oddItems;
    },

    instantiateBet(oddsData, oddsItemPrefab, betPools, betBackgroundPools) {
        oddsData.sort(() => -1);
        cc.warn('oddsData:', oddsData);
        oddsData.forEach(element => {
            const buffalosNumber = element.split(';')[0];
            const numberBetRow = Number(buffalosNumber.split('')[0]) - 1;
            const oddsValue = element.split(';')[1];
            const oddItem = cc.instantiate(oddsItemPrefab);
            oddItem.name = buffalosNumber;
            oddItem.parent = betPools[numberBetRow];

            const oddItemScript = oddItem.getComponent('betItemController');
            oddItemScript.setValueLabel(buffalosNumber, oddsValue, '');
            const odItemBackground = betBackgroundPools[numberBetRow].getChildByName(oddItem.name);
            oddItemScript.setBetButtonBackground(odItemBackground);
        });
    },
    bet(betPools) {
        this.betCurrent = [];
        const bLns = [];
        const gn = Data.instance.gameNumber;
        const bId = '10';
        const betItems = [];
        betPools.forEach(element => {
            const temp = element.getChildren();
            temp.forEach(element => {
                betItems.push(element);
            });
        });
        betItems.forEach(element => {
            const betItemController = element.getComponent('betItemController');
            const betGot = betItemController.getBet();
            if (betGot != undefined) {
                bLns.push(betGot);
                this.betCurrent.push(element);
            }
        });
        const payload = {
            event: gaGameCMD.R_PLAY_GAME,
            data: { bId, bLns, gn }
        };
        return payload;
    },

    showResult() {
        const data = Data.instance.dataRoundCurrent.data;
        const buffalosWin = (data.orh[0] < data.orh[1]) ? data.orh[0] + data.orh[1] : data.orh[1] + data.orh[0];
        const resultString = `Oder Finish: ` + data.orh + `\n`
            + `Buffalo Win: ` + buffalosWin + `\n`
            + `Bet Money Win: ` + Number(data.wg.split(';')[1]).toFixed() + `K`;
        this.betCurrent.forEach(element => {
            const elementComponent = element.getComponent('betItemController');
            if (element.name == buffalosWin) {
                elementComponent.setColorButtonBackground(this.red);
                return;
            }
            elementComponent.setColorButtonBackground(this.green);
        });
        return resultString;
    },

});
