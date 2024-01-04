import { gaJPHistoryDataItem } from "../../../NodePool/gaCustomDataType";
import gaUtils from "../../../Utilities/gaUtils";
import gaHistoryItem from "./gaHistoryItem";
const { ccclass, property } = cc._decorator;

@ccclass
export class gaJackpotHistoryItem extends gaHistoryItem {
    @property(cc.Label) account: cc.Label = null;
    @property(cc.Node) overlay: cc.Node = null;
    @property(cc.Label) time: cc.Label = null;
    @property(cc.Label) winAmount: cc.Label = null;

    onSpawn(data: gaJPHistoryDataItem, index: number): void {
        this.time.string = gaUtils.getTimeString(data.timeStamp.toString());
        this.account.string = gaUtils.formatUserName(data.displayName, 14);
        this.winAmount.string = gaUtils.formatMoney(data.jackpotAmount);
        if (this.overlay) {
            this.overlay.active = index % 2 == 0;
        }
    }
}