import gaBaseConfig from "../../Config/gaBaseConfig";
import gaLocalize from "../../Common/gaLocalize";
import gaNotifyComponent from "./gaNotifyComponent";
import gaUtils from "../../Utilities/gaUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaNotifyMessage extends gaNotifyComponent {

    speed: number = 320;

    onBeforeSceneChange() {
        super.onBeforeSceneChange();
        this.node.scaleY = 0;
    }

    show(data: any) {
        if (!this.validateData(data)) {
            return;
        }
        this.sortDataMessage();
        if (!this._isShow) {
            this.runAnimShow();
        }
    }

    validateData(data) {
        let json = this.getStringDataNotify(data).replace(/'/g, '"');
        try {
            let result = !!(JSON.parse(json));
            if (result) {
                this._lstMsgs.push(data);
            }
            return result;
        } catch (e) {
            return false;
        }
    }

    sortDataMessage() {
        this._lstMsgs.sort((a: any, b: any) => ((a.type === 0 && b.type !== 0) ? -1 : (a.type !== 0 && b.type === 0) ? 1 : 0));
        this._lstMsgs.sort((a: any, b: any) => {
            const _a: any = {};
            _a.type = a.type;
            if (_a.type > 0) {
                _a.amount = this.replaceAmountData(a);
            }
            const _b: any = {};
            _b.type = b.type;
            if (_b.type > 0) {
                _b.amount = this.replaceAmountData(b);
            }
            if (_a.type !== 0 && _b.type !== 0) {
                if (_a.amount > _b.amount) return -1;
                if (_a.amount < _b.amount) return 1;
            }
            return 0;
        });
    }

    replaceAmountData(dataInput) {
        const { data, type } = dataInput;
        const notifyConfig = gaBaseConfig.instance.NOTIFY_CONFIG[type];
        const regex = /[^0-9.-]+/g;
        const goldReward = data[notifyConfig.goldReward];
        return Number(goldReward.replace(regex, ""));
    }

    runAnimShow() {
        this._isShow = true;
        this.node.active = true;
        this.node.scaleY = 0;
        this.node.stopAllActions();
        cc.tween(this.node)
            .to(0.5, { scaleY: 1 })
            .call(() => {
                this.onStackMessage();
            })
            .start();
    }

    hide() {
        this._isShow = false;
        cc.tween(this.node)
            .to(0.5, { scaleY: 0 })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    play(data: any) {
        let json = this.getStringDataNotify(data).replace(/'/g, '"');
        let objMessage = JSON.parse(json);
        this.createNotifyMessage(objMessage);
        this.contentNode.getComponent(cc.Layout).updateLayout();
        let dX = (this.contentNode.width + this.node.width) / 2;
        this.contentNode.x = dX;
        this.contentNode.stopAllActions();
        cc.tween(this.node)
            .delay(0)
            .call(() => {
                const timer = (2 * dX) / this.speed;
                cc.tween(this.contentNode)
                    .to(timer, { x: -dX })
                    .delay(0.5)
                    .call(() => {
                        this.onStackMessage();
                    })
                    .start();
            })
            .start();
    }

    getStringDataNotify(dataInput) {
        const { data, message, type } = dataInput;
        if (type < 0) {
            return "";
        }
        let str = "";
        const configTxtNotify = gaLocalize.instance["txtNotify"];
        switch (type) {
            default:
                // let str = gaUtils.cloneDeep(configTxtNotify.message);
                // str = formatString(str, [message]); ''
                break;
        }
        return str;
    }
}
