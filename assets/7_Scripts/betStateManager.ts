import { gaGameCMD } from "./cc-arcade-base/Scripts/Network/gaCommandID";
import { Data, ccData } from "./data";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BetStateManager extends cc.Component {
    private bettingCurrent: Array<any> = [];
    private betButtonItems: Array<cc.Node> = [];

    getODDs(response: any): any {
        const oddsTemp = response.data.exD.ed.split('#');
        return oddsTemp[3].split(',');
    }

    instantiateBet(oddsData: any, oddsItemPrefab: cc.Prefab, betPools: cc.Node[], betBackground: cc.Node[]): void {
        oddsData.sort(() => -1);
        oddsData.forEach(element => {
            const buffalosNumber = element.split(';')[0];
            const indexBetRow = Number(buffalosNumber.charAt(0)) - 1;
            const oddsValue = element.split(';')[1];
            const betButtonItem = cc.instantiate(oddsItemPrefab);
            betButtonItem.name = buffalosNumber;
            betButtonItem.parent = betPools[indexBetRow];
            this.betButtonItems.push(betButtonItem);

            const betItemController = betButtonItem.getComponent('betItemController');
            betItemController.setValueLabel(buffalosNumber, oddsValue, 0);
            const betButtonBackground = betBackground[indexBetRow].getChildByName(betButtonItem.name);
            betItemController.setBetButtonBackground(betButtonBackground);
        });
    }

    bet() {
        const bLns = [];
        const gn = Data.instance.gameNumber;
        const bId = '10';
        this.betButtonItems.forEach(element => {
            const betData = element.getComponent('betItemController').getBet();
            if (betData) {
                bLns.push(betData);
                this.bettingCurrent.push(element);
            }
        });
        const payload = {
            event: gaGameCMD.R_PLAY_GAME,
            data: { bId, bLns, gn }
        };
        return payload;
    }

    showResult() {
        const buffalosWin = Data.instance.getBuffalosWin();
        const resultString = `Oder Finish: ` + Data.instance.getOderFinish() + `\n`
            + `Buffalo Win: ` + buffalosWin + `\n`
            + `Bet Money Win: ` + Data.instance.getMoneyWin() + `K`;
        this.bettingCurrent.forEach(element => {
            const betItemController = element.getComponent('betItemController');
            betItemController.resetBetValue();
        });
        return resultString;
    }
}
