import EventsCode from "../Definitions/gaEventsCode";
import gaScreenUtils from "../Utilities/gaScreenUtils";
import EventEmitter from "./gaEventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaSafeArea extends cc.Component {
    @property(cc.Boolean) private isPortrait: boolean = false;
    @property(cc.Boolean) private safeBottom: boolean = false;
    @property(cc.Boolean) private safeLeft: boolean = true;
    @property(cc.Boolean) private safeRight: boolean = true;
    @property(cc.Boolean) private safeLeftCurve: boolean = true;
    @property(cc.Boolean) private safeRightCurve: boolean = true;


    protected onLoad(): void {
        EventEmitter.instance.registerEvent(EventsCode.COMMON.ON_SCREEN_RESIZE, this.setSafeArea, this);
    }

    protected onEnable(): void {
        this.setSafeArea();
    }

    protected onDestroy(): void {
        EventEmitter.instance && EventEmitter.instance.removeEvents(this);
    }

    protected setSafeArea() {
        const notchSize = gaScreenUtils.getNotchSize();
        const widget = this._getWidget();
        widget.top = widget.bottom = widget.left = widget.right = 0;

        if (notchSize > 0) {
            if (this.isPortrait && this.safeLeft) {
                widget.top += notchSize;
            } else {
                if (gaScreenUtils.getOrientation() == -90) {
                    if (this.safeLeftCurve) widget.left += gaScreenUtils.SAFE_CURVE_IPX;
                    if (this.safeRight) widget.right += notchSize;
                } else if (gaScreenUtils.getOrientation() == 90 && this.safeLeft) {
                    if (this.safeLeft) widget.left += notchSize;
                    if (this.safeRightCurve) widget.right += gaScreenUtils.SAFE_CURVE_IPX;
                }
            }
        }

        if (this.safeBottom) {
            widget.bottom += gaScreenUtils.getSafeY();
        }

        widget.updateAlignment();

        const childrenWidget = this.node.getComponentsInChildren(cc.Widget);
        childrenWidget.forEach(i => i.updateAlignment());
    }

    private _getWidget(): cc.Widget {
        const widget = this.getComponent(cc.Widget) || this.addComponent(cc.Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        return widget;
    }
}