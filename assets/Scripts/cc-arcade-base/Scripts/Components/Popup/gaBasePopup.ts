import gaBaseConfig from "../../Config/gaBaseConfig";
import gaEventsCode from "../../Definitions/gaEventsCode";
import { POPUP_ANIMATION, gaStylePopupAnimation } from "../../NodePool/gaCustomDataType";
import gaComponent from "../gaComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class gaBasePopup extends gaComponent {

    @property(cc.Node)
    popupTitle: Node = null;

    @property(cc.Node)
    contents: cc.Node = null;

    @property(cc.Node)
    popupBackground: cc.Node = null;

    @property(cc.Button)
    btnClose: cc.Button = null;

    @property zIndex: number = 0;

    @property(gaStylePopupAnimation)
    animStyle: gaStylePopupAnimation = new gaStylePopupAnimation();

    public abstract popupType: string;

    _showPosition: cc.Vec2 = null;
    fullScale: number = 1;

    private _isShowing: boolean = false;
    get isShowing(): boolean {
        return this._isShowing;
    }
    set isShowing(state: boolean) {
        this._isShowing = state;
    }

    public set setAnimStyle(style: gaStylePopupAnimation) {
        this.animStyle = style;
    }

    protected onLoad(): void {
        super.onLoad();
        this.initObj();
        this.onResetState();
    }

    initObj() {
        if (this.contents == null) {
            this.contents = this.node;
        }
        if (this.btnClose) {
            this.btnClose.node.off('click');
            this.btnClose.node.on('click', (() => {
                this.soundPlayer.playSFXClick();
                this.btnClose.interactable = false;
                this.onClose();
            }), this);
        }
        this._showPosition = cc.v2(this.contents.x, this.contents.y);
        this.fullScale = 1;
    }

    show(data: any = null): void {
        this._isShowing = true;
        this.node.stopAllActions();
        this.contents.stopAllActions();
        if (this.btnClose) {
            this.btnClose.interactable = true;
        }
        this.transitionShow();
    }

    transitionShow(): void {
        this.node.active = true;
        this.contents.opacity = 0;
        let animation = [];
        switch (this.animStyle.show) {
            case POPUP_ANIMATION.FADE:
                this.showFade(animation);
                break;
            case POPUP_ANIMATION.PULSE:
                this.showPulse(animation);
                break;
            case POPUP_ANIMATION.TOP_DOWN:
                this.showTopDown(animation);
                break;
            case POPUP_ANIMATION.BOTTOM_UP:
                this.showBottomUp(animation);
                break;
            case POPUP_ANIMATION.FROM_LEFT:
                this.showFromLeft(animation);
                break;
            case POPUP_ANIMATION.FROM_RIGHT:
                this.showFromRight(animation);
                break;
            default:
                this.showDefault();
                break;
        }

        if (animation && animation.length > 0) {
            if (animation.length > 1) {
                this.contents.runAction(cc.sequence(animation));
            }
            else {
                this.contents.runAction(animation[0]);
            }
        }
    }

    showPulse(animation): void {
        this.node.scale = 1;
        this.contents.opacity = 0;
        this.contents.scale = this.fullScale - 0.4;
        this.contents.position = this._showPosition;
        animation.push(
            cc.spawn(
                cc.fadeIn(0.45).easing(cc.easeSineOut()),
                cc.scaleTo(0.45, this.fullScale).easing(cc.easeBackOut()),
            ));
    }

    showFade(animation): void {
        this.node.scale = 1;
        this.contents.position = this._showPosition;
        animation.push(cc.fadeIn(0.3));
    }

    onBeforeMove(startPos): void {
        this.node.scale = 1;
        this.contents.opacity = 255;
        this.contents.position = startPos;
    }

    showTopDown(animation): void {
        const startPos = cc.v2(this._showPosition.x, gaBaseConfig.visibleSize.height / 2 + this.contents.height / 2 + 50);
        this.onBeforeMove(startPos);
        animation.push(cc.moveTo(0.65, this._showPosition).easing(cc.easeBackOut()));
    }

    showBottomUp(animation): void {
        const startPos = cc.v2(this._showPosition.x, -gaBaseConfig.visibleSize.height / 2 - this.contents.height / 2 - 50);
        this.onBeforeMove(startPos);
        animation.push(cc.moveTo(0.65, this._showPosition).easing(cc.easeBackOut()));
    }

    showFromLeft(animation): void {
        const startPos = cc.v2(-gaBaseConfig.visibleSize.width / 2 - this.contents.width / 2 - 50, this._showPosition.y);
        this.onBeforeMove(startPos);
        animation.push(cc.moveTo(0.65, this._showPosition).easing(cc.easeBackOut()));
    }

    showFromRight(animation): void {
        const startPos = cc.v2(gaBaseConfig.visibleSize.width / 2 + this.contents.width / 2 + 50, this._showPosition.y);
        this.onBeforeMove(startPos);
        animation.push(cc.moveTo(0.65, this._showPosition).easing(cc.easeBackOut()));
    }

    showDefault(): void {
        this.node.scale = 1;
        this.contents.opacity = 255;
    }

    hide(): void {
        this._isShowing = false;
        this.transitionHide();
    }

    transitionHide(): void {
        let animation = [];
        switch (this.animStyle.hide) {
            case POPUP_ANIMATION.FADE:
                this.hideFade(animation);
                break;
            case POPUP_ANIMATION.PULSE:
                this.hidePulse(animation);
                break;
            case POPUP_ANIMATION.TOP_DOWN:
                this.hideTopDown(animation);
                break;
            case POPUP_ANIMATION.BOTTOM_UP:
                this.hideBottomUp(animation);
                break;
            case POPUP_ANIMATION.FROM_LEFT:
                this.hideFromLeft(animation);
                break;
            case POPUP_ANIMATION.FROM_RIGHT:
                this.hideFromRight(animation);
                break;
            default:
                this.hideDefault();
                break;
        }
        if (animation && animation.length > 0) {
            animation.push(cc.callFunc(() => {
                this.hideDefault();
            }));
            this.contents.runAction(cc.sequence(animation));
        }
    };

    hideFade(animation) {
        animation.push(cc.fadeOut(0.1));
    }

    hidePulse(animation): void {
        animation.push(
            cc.spawn(
                cc.fadeOut(0.45).easing(cc.easeSineIn()),
                cc.scaleTo(0.45, this.fullScale - 0.4).easing(cc.easeBackIn()),
            )
        );
    }

    hideTopDown(animation): void {
        const hidePos = cc.v2(this._showPosition.x, gaBaseConfig.visibleSize.height / 2 + this.contents.height / 2 + 50);
        animation.push(cc.moveTo(0.65, hidePos).easing(cc.easeBackIn()));
    }

    hideBottomUp(animation): void {
        const hidePos = cc.v2(this._showPosition.x, -gaBaseConfig.visibleSize.height / 2 - this.contents.height / 2 - 50);
        animation.push(cc.moveTo(0.65, hidePos).easing(cc.easeBackIn()));
    }

    hideFromLeft(animation): void {
        const hidePos = cc.v2(-gaBaseConfig.visibleSize.width / 2 - this.contents.width / 2 - 50, this._showPosition.y);
        animation.push(cc.moveTo(0.65, hidePos).easing(cc.easeBackIn()));
    }

    hideFromRight(animation): void {
        const hidePos = cc.v2(gaBaseConfig.visibleSize.width / 2 + this.contents.width / 2 + 50, this._showPosition.y);
        animation.push(cc.moveTo(0.65, hidePos).easing(cc.easeBackIn()));
    }

    hideDefault() {
        this.node.active = false;
        this.onResetState();
    }

    onResetState() {
        if (!cc.isValid(this.node)) return;
        this.contents.opacity = 255;
        this.node.scale = 0;
    }

    onClose() {
        this.emit(gaEventsCode.POPUP.CLOSE_TOP_POPUP);
    }
}
