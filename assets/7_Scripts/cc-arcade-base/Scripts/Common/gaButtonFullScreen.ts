import gaComponent from "../Components/gaComponent";
import gaBaseConfig from "../Config/gaBaseConfig";
import gaEventsCode from "../Definitions/gaEventsCode";
import gaScreenUtils from "../Utilities/gaScreenUtils";
import gaUtils from "../Utilities/gaUtils";
import gaReferenceManager from "./gaReferenceManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaButtonFullScreen extends gaComponent {
    private divFS: any = null;

    private _canvas: cc.Canvas = null;
    private get canvas(): cc.Canvas {
        if (!this._canvas) {
            this._canvas = cc.Canvas.instance;
        }
        return this._canvas;
    }

    private defaultStyle: Record<string, any> = {};

    protected onLoad(): void {
        gaReferenceManager.instance.btnFullScreen = this.node;
        this.node.removeComponent(cc.Sprite);
        this.divFS = window['divFullscreen'] || document.getElementById('div_full_screen');
        if (!cc.sys.isMobile || !cc.sys.isBrowser || !this.divFS) {
            this.destroy();
            return;
        }

        const element = this.divFS.children[0];
        if (element) {
            this.defaultStyle = {
                width: element.style.width,
                height: element.style.height,
                top: element.style.top,
                right: element.style.right,
                left: element.style.left,
                bottom: element.style.bottom,
            }
        }

        super.onLoad();
        this.onScreenResize();
    }

    protected initEvents(): void {
        this.register(gaEventsCode.COMMON.ON_SCREEN_RESIZE, this.onScreenResize);
        this.node.on(cc.Node.EventType.POSITION_CHANGED, this.onScreenResize, this);
        this.node.on(cc.Node.EventType.SIZE_CHANGED, this.onScreenResize, this);
    }

    protected onDestroy(): void {
        if (this.defaultStyle) {
            this.setStyle('width', this.defaultStyle.width);
            this.setStyle('height', this.defaultStyle.height);
            this.setStyle('top', this.defaultStyle.top);
            this.setStyle('right', this.defaultStyle.right);
            this.setStyle('left', this.defaultStyle.left);
            this.setStyle('bottom', this.defaultStyle.bottom);
        }
        this.setVisible(true);
        super.onDestroy();
    }

    protected onDisable(): void {
        this.setVisible(false);
    }

    protected onEnable(): void {
        this.setVisible(true);
    }

    protected onScreenResize() {
        this.unschedule(this.updateStyle);
        this.scheduleOnce(this.updateStyle);
    }

    protected updateStyle() {
        const scale = this.getScale();
        this.setStyle('width', `${this.node.width * scale}px`);
        this.setStyle('height', `${this.node.height * scale}px`);
        if (gaScreenUtils.getOrientation()) {
            this.setStyle('top', `${this.getY(scale)}px`);
            this.setStyle('right', `${this.getX(scale)}px`);
            this.setStyle('left', 'unset');
            this.setStyle('bottom', 'unset');
        } else {
            this.setStyle('bottom', `${this.getX(scale)}px`);
            this.setStyle('right', `${this.getY(scale)}px`);
            this.setStyle('left', 'unset');
            this.setStyle('top', 'unset');
        }
    }

    protected setStyle(key: string, value: any): void {
        if (!this.divFS || !this.divFS.children) return;
        for (let index = 0; index < this.divFS.children.length; index++) {
            const element = this.divFS.children[index];
            element.style[key] = value;
        }
    }

    protected setVisible(visible: boolean) {
        const disableFullscreen = gaUtils.getParam(window.location.href, 'disableFullscreen');
        if (this.divFS ) {
            this.divFS .style.display = !disableFullscreen && visible ? 'block' : 'none';
        }
   }

    protected getScale(): number {
        const frameSize = cc.view.getFrameSize();
        if (this.canvas.fitWidth) {
            return frameSize.width / gaBaseConfig.designSize.width;
        }
        return frameSize.height / gaBaseConfig.designSize.height;
    }

    protected getY(scale: number): number {
        const visibleSize = gaBaseConfig.visibleSize;
        const visibleRect = cc.view.getVisibleSize();
        const spriteTopAlign = visibleSize.height / 2 - this.node.y - this.node.height / 2;
        const unvisbleSize = visibleRect.height - visibleSize.height;
        return (unvisbleSize / 2 + spriteTopAlign) * scale;
    }

    protected getX(scale: number): number {
        const visibleSize = gaBaseConfig.visibleSize;
        const visibleRect = cc.view.getVisibleSize();
        const spriteRightAlign = visibleSize.width / 2 - this.node.x - this.node.width / 2;
        const unvisbleSize = visibleRect.width - visibleSize.width;
        return (unvisbleSize / 2 + spriteRightAlign) * scale;
    }
}
