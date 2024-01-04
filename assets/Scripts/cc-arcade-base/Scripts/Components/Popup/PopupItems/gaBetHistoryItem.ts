import EventsCode from "../../../Definitions/gaEventsCode";
import { gaBetHistoryDataItem } from "../../../NodePool/gaCustomDataType";
import gaUtils from "../../../Utilities/gaUtils";
import gaHistoryItem from "./gaHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaBetHistoryItem extends gaHistoryItem {
    @property(cc.Label) session: cc.Label = null;
    @property(cc.Node) overlay: cc.Node = null;
    @property(cc.Label) time: cc.Label = null;
    @property(cc.Label) winAmount: cc.Label = null;
    @property(cc.Label) bet: cc.Label = null;
    @property(cc.Color) winColor: cc.Color = null;
    @property(cc.Color) loseColor: cc.Color = null;
    @property(cc.Color) drawColor: cc.Color = null;

    protected data: gaBetHistoryDataItem = null;

    onSpawn(data: gaBetHistoryDataItem, index: number): void {
        this.data = data;
        if (this.time) this.time.string = gaUtils.getTimeString(data.timeStamp);
        if (this.session) this.session.string = data.gameNumber;
        if (this.bet) this.bet.string = gaUtils.formatMoney(data.betAmount);
        if (this.winAmount) {
            this.winAmount.string = (data.winAmount > 0 ? '+' : '') + gaUtils.formatCurrency(data.winAmount);
            this.winAmount.node.color = data.winAmount > 0 ? this.winColor : (data.winAmount < 0 ? this.loseColor : this.drawColor);
        }
        if (this.overlay) {
            this.overlay.active = index % 2 == 0;
        }
    }

    onClickDetail(): void {
        this.soundPlayer.playSFXClick();
        this.emit(EventsCode.POPUP.SHOW_HISTORY_DETAIL , this.data);
    }
}
