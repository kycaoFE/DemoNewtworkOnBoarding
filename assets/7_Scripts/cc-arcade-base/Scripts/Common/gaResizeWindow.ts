import GameConfig from "../Config/gaBaseConfig";
import EventCode from "../Definitions/gaEventsCode";
import gaUtils from "../Utilities/gaUtils";
import Emitter from "./gaEventEmitter";
const CanvasScaleByOrientation = require('CanvasScaleByOrientation');
const { ccclass, property } = cc._decorator;

@ccclass
export default class gaResizeWindow extends CanvasScaleByOrientation {

    private _visibleSize: cc.Size;

    update(dt: number) {
        if (!this._visibleSize.equals(cc.view.getVisibleSize())) {
            this.scaleCanvasByOrientation();
        }
    }

    onGameShow() {
        if (cc.sys.isMobile) {
            const eventResize = new Event('gameShow');
            window.dispatchEvent(eventResize);
        }
    }

    protected scaleCanvasByOrientation(): void {
        super.scaleCanvasByOrientation();

        const { visibleSize, designSize } = GameConfig;

        this._visibleSize = cc.view.getVisibleSize();

        const designRatio = designSize.width / designSize.height;
        const maxRatio = designSize.maxWidth / designSize.height;
        const viewPortRatio = this._visibleSize.width / this._visibleSize.height;
        const scale = gaUtils.clamp(viewPortRatio, designRatio, maxRatio);

        if (this.canvas.fitWidth) {
            visibleSize.width = designSize.width;
            visibleSize.height = designSize.width / scale;
        } else {
            visibleSize.width = designSize.height * scale;
            visibleSize.height = designSize.height;
        }

        this.node.width = visibleSize.width;
        this.node.height = visibleSize.height;

        Emitter.instance.emit(EventCode.COMMON.ON_SCREEN_RESIZE);
    }
}
