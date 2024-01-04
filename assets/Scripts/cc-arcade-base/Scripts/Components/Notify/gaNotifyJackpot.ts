import { gaNotifyData } from "../../NodePool/gaCustomDataType";
import gaNotifyComponent from "./gaNotifyComponent";
import gaBaseConfig from "../../Config/gaBaseConfig";
import gaNotifyJackpotItem from "./gaNotifyJackpotItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaNotifyJackpot extends gaNotifyComponent {
    @property (cc.Prefab)
    protected itemPrefab: cc.Prefab = null;
    protected _notifyItem: gaNotifyJackpotItem = null;
    private _isFirstShow: boolean = true;
    protected allowShowNotify: boolean = true;
    protected NOTIFY_CONFIG: any = {
        TIME_MOVE: 0.25,
        TIME_IDLE_JP: 3.5,
        TIME_IDLE_BGW: 2.5
    }
    get isEmpty(): boolean {
        return this._lstMsgs.length == 0;
    }

    public initItems(): void {
        let item = cc.instantiate(this.itemPrefab);
        item.setParent(this.contentNode);
        this._notifyItem = item.getComponent(gaNotifyJackpotItem);
        this._notifyItem.initObj();
    }

    public onEventHide(): void {
        this._lstMsgs.length = 0;
        this._isFirstShow = true;
        this.reset();
    }

    public onViewInGame(): void {
        this.allowShowNotify = false;
        this.reset();
    }

    public onAfterFinishedRacing(): void {
        this.allowShowNotify = true;
        if (this._lstMsgs.length > 0) {
            this.node.stopAllActions();
            this._isShow = true;
            this.node.active = true;
            this.onStackMessage();
        } else {
            this.hide();
        }
    }

    public reset(): void {
        this.node.stopAllActions();
        this._notifyItem && this._notifyItem.reset();
        this._isShow = false;
    }

    show(data: any): void {
        const lstNotify: gaNotifyData[] = this.getFormatData(data);
        if (this._lstMsgs.length >= gaBaseConfig.instance.NOTIFY_JACKPOT.limited_stack_size - lstNotify.length + 1) {
            this._lstMsgs.splice(0, lstNotify.length);
        }
        this._lstMsgs = this._lstMsgs.concat(lstNotify);
        this.sortData(this._lstMsgs);

        if (!this.allowShowNotify) return;
        if (!this._isShow) {
            this._isShow = true;
            this.node.active = true;
            this.onStackMessage();
        }
    }

    protected getFormatData(data: any): gaNotifyData[] {
        const lstNotify: gaNotifyData[] = [];
        if (data.jpAmt) { // jackpot
            const item = new gaNotifyData(data);
            item.winAmount = data.jpAmt;
            item.type = gaBaseConfig.instance.NOTIFY_TYPE.JACKPOT;
            lstNotify.push(item);
        }
        if (data.wat) { // bigwin
            const item = new gaNotifyData(data);
            item.winAmount = data.wat;
            item.type = gaBaseConfig.instance.NOTIFY_TYPE.BIGWIN;
            lstNotify.push(item);
        }
        return lstNotify;
    }

    public hide(): void {
        this._isFirstShow = true;
        this._isShow = false;
        this.node.stopAllActions();
        this.node.active = false;
    }

    public play(data: gaNotifyData) : void {
        const {TIME_MOVE, TIME_IDLE_JP, TIME_IDLE_BGW} = this.NOTIFY_CONFIG;
        const timeIdle = data.type == gaBaseConfig.instance.NOTIFY_TYPE.JACKPOT ? TIME_IDLE_JP : TIME_IDLE_BGW;
        if (this._isFirstShow) {
            this._isFirstShow = false;
            this._notifyItem.showItem(data, TIME_MOVE, timeIdle, true, this);
        } else {
            this._notifyItem.showItem(data, TIME_MOVE, timeIdle, false, this);
        }
        this.node.stopAllActions();
        cc.tween(this.node)
            .delay(timeIdle + TIME_MOVE * 2 + 0.2)
            .call(() => {
                this.onStackMessage();
            })
            .start();
    }

    protected sortData(lstMessage: gaNotifyData[]): void {
        const types = gaBaseConfig.instance.NOTIFY_TYPE;
        lstMessage.sort((a, b) => ((a.type == types.JACKPOT && b.type != types.JACKPOT) ? -1 : (a.type != types.JACKPOT && b.type == types.JACKPOT) ? 1 : 0));
        lstMessage.sort((a, b) => ((a.type == types.JACKPOT && b.type == types.JACKPOT) ? (a.winAmount > b.winAmount ? -1 : (a.winAmount < b.winAmount ? 1 : 0)) : 0));
    }
}