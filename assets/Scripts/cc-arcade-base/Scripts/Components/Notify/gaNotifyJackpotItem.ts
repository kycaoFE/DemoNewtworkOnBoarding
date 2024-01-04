import gaBaseConfig from "../../Config/gaBaseConfig";
import { gaNotifyData } from "../../NodePool/gaCustomDataType";
import Utils from "../../Utilities/gaUtils";
const { ccclass, property } = cc._decorator;
@ccclass
export default class gaNotifyJackpotItem extends cc.Component {
    @property (cc.Label)
    protected userName: cc.Label = null;
    @property (cc.Label)
    protected winAmount: cc.Label = null;
    @property (cc.Node)
    protected bgJp: cc.Node = null;
    @property (cc.Node)
    protected bgBigWin: cc.Node = null;

    public initObj(): void {
        this.reset();
    }

    protected updateData(notifyData: gaNotifyData): void {
        // Override here
        const isJp = notifyData.type == gaBaseConfig.instance.NOTIFY_TYPE.JACKPOT;
        this.userName.string = Utils.formatUserName(notifyData.username).toUpperCase();
        this.winAmount.string = Utils.formatCurrency(notifyData.winAmount);
        this.winAmount.node.color = isJp ? cc.Color.BLACK.fromHEX('#FFCC00') : cc.Color.WHITE;
        this.bgJp.active = isJp;
        this.bgBigWin.active = !isJp;
    }

    public showItem(data: gaNotifyData, timeMove: number, timeIdle: number, isFirstShow: boolean = false, controller: any): void {
        const posStart = cc.v2(-this.node.width - 50, 0);
        const posEnd = cc.v2(10, 0);
        this.node.stopAllActions();
        const checkLastItem = () => {
            if (controller.isEmpty) {
                cc.tween(this.node).to(timeMove, { scaleY: 0, opacity: 0}, { easing: "backIn" }).start();
            } else {
                cc.tween(this.node).to(timeMove, {position: posStart}).start();
            }
        }
        if (isFirstShow) {
            this.node.active = true;
            this.node.position = posEnd;
            this.node.scale = 0;
            this.node.opacity = 1;
            cc.tween(this.node)
            .call(() => {
                this.updateData(data);
            })
            .to(timeMove/2, { scale: 1.15, opacity: 255}, { easing: "backOut" })
            .to(timeMove/2, { scale: 1})
            .delay(timeIdle)
            .call(checkLastItem)
            .start();
        } else {
            this.node.active = true;
            this.node.setPosition(posStart);
            this.node.scale = 1;
            this.node.opacity = 255;
            cc.tween(this.node)
            .call(() => {
                this.updateData(data);
            })
            .to(timeMove, { position: posEnd})
            .delay(timeIdle)
            .call(checkLastItem)
            .start();
        }
    }

    public reset(): void {
        this.node.stopAllActions();
        this.node.active = false;
    }
}