import gaEventsCode from "../../Definitions/gaEventsCode";
import gaScreenUtils from "../../Utilities/gaScreenUtils";
import gaUtils from "../../Utilities/gaUtils";
import gaComponent from "../gaComponent";

const { ccclass, requireComponent, property } = cc._decorator;

@ccclass
@requireComponent(cc.Widget)
export class HRRefreshWidget extends gaComponent {
    private _defaultLeftPadding = 0;
    private _defaultRightPadding = 0;
    private _tweenDelay: cc.Tween = null;
    onLoad() {
        super.onLoad();
        const widget = this.getComponent(cc.Widget);
        this._defaultLeftPadding = widget.left;
        this._defaultRightPadding = widget.right;
    }

    protected initEvents(): void {
        this.register(gaEventsCode.COMMON.ON_SCREEN_RESIZE, this.refresh);
        const widget = this.getComponent(cc.Widget);
        const target = widget.target || widget.node.parent;
        target && target.on(cc.Node.EventType.SIZE_CHANGED, this.refresh, this);
    }

    onEnable() {
        this.refresh();
    }

    refresh() {
        gaUtils.stopTween(this._tweenDelay);
        this._tweenDelay = cc.tween(this).delay(0.1).call(this.updateWidget.bind(this)).start();
    }

    updateWidget() {
        const widget = this.getComponent(cc.Widget);
        if (!widget) return;
        widget.left = this._defaultLeftPadding;
        widget.right = this._defaultRightPadding;
        widget.updateAlignment();

        const childrenWidget = this.node.getComponentsInChildren(cc.Widget);
        childrenWidget.forEach(i => i.updateAlignment());
    }
}
