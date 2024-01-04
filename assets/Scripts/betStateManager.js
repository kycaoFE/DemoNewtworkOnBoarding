import { gaGameCMD } from "./cc-arcade-base/Scripts/Network/gaCommandID";
cc.Class({
    extends: cc.Component,

    properties: {
        red: new cc.Color(255, 0, 0),
        green: new cc.Color(0, 255, 0),
        yellow: new cc.Color(255, 255, 0)
    },

    getODDs(dataResponse){
        let oddsTemp = dataResponse.data.exD.ed.split("#");
        this.gn = oddsTemp[0].split(':')[1];
        let odds = oddsTemp[3];
        // this.uiManager.setLabel(odds);
        let oddItems = odds.split(',');
        return oddItems;
    },
    
    instantiateBet(oddsData, oddsItemPrefab, oddsItemLayout, ItemsBackground){
        let oddItems = oddsData;
        oddItems.sort(()=> -1);
        cc.warn(oddItems);
        oddItems.forEach(element => {
            let Number = element.split(';')[0];
            let firstNumber = Number.split('')[0];
            let oddsValue = element.split(';')[1];
            const oddItem = cc.instantiate(oddsItemPrefab);
            oddItem.name = Number;
            oddItem.parent = oddsItemLayout.getChildByName('Payout Layout '+firstNumber);
            const oddItemScript = oddItem.getComponent('betItemController');
            oddItemScript.setValueLabel(Number, oddsValue , '');
            const odItemBackground = ItemsBackground.getChildByName('Payout Layout '+firstNumber).getChildByName(oddItem.name);
            oddItemScript.setBetButtonBackground(odItemBackground);
        });
    },
    bet(betPool, callback){
        this.betCurrent = [];
        const bLns = [];
        const gn = this.gn;
        const bId = '10';
        const betLayouts = betPool.getChildren();
        const betItems = [];
        betLayouts.forEach(element => {
            const temp = element.getChildren();
            temp.forEach(element => {
                betItems.push(element);
            });
        });
        betItems.forEach(element => {
            var betComponent = element.getComponent('betItemController');
            var betGot = betComponent.getBet();
            if(betGot != undefined) {
                bLns.push(betGot);
                this.betCurrent.push(element);
            }
        });
        const payload ={
            event: gaGameCMD.R_PLAY_GAME,
            data : { bId, bLns, gn }
        };
        callback(payload);
    },

    showResult(data){
        cc.warn(data);
        const buffalosWin = data.orh[0]+data.orh[1];
        const resultString = `Oder Finish: ` + data.orh +`\n` 
            + `Buffalo Win: ` + buffalosWin + `\n` 
            + `Bet Money Win: `+Number(data.wg.split(';')[1]).toFixed()+`K`;
        this.betCurrent.forEach(element => {
            const elementComponent = element.getComponent('betItemController');  
            if(element.name == buffalosWin || element.name == buffalosWin.split('').reverse().join('')){
                elementComponent.setColorButtonBackground(this.red);
                return;
            }
            elementComponent.setColorButtonBackground(this.green);
        });
        return resultString;
    },

});
