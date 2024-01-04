import { gameCommonUtils } from "../../Definitions/gaCommon";
import gaEventsCode from "../../Definitions/gaEventsCode";
import gaScreenUtils from "../../Utilities/gaScreenUtils";
import gaComponent from "../gaComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaSideMenu extends gaComponent {

    @property(cc.Node)
    nodeMove: cc.Node = null;

    @property(cc.Node)
    btnShow: cc.Node = null;

    @property(cc.Node)
    btnHide: cc.Node = null;

    @property(cc.Node)
    overlay: cc.Node = null;

    @property(cc.Node)
    btnExitGame: cc.Node = null;

    OPACITY_SHOW_OVERLAY: number = 150;

    isHide: boolean = false;
    isActionDone: boolean = false;

    frameWidth: number = 0;

    menuShowPos: cc.Vec2 = null;

    protected onLoad(): void {
        super.onLoad();
        this.frameWidth = this.nodeMove.width;
        this.menuShowPos = cc.v2(this.nodeMove.x, this.nodeMove.y);
        this.btnExitGame && (this.btnExitGame.active = gameCommonUtils.checkConditionCloseGameIframe());
        if (this.overlay) {
            this.overlay.on(cc.Node.EventType.TOUCH_START, () => {
                this.transitionMenu();
            })
        }
    }

    protected start(): void {
        this.resetSideMenu();
    }

    protected initEvents(): void {
        this.register(gaEventsCode.COMMON.ON_SCREEN_RESIZE, this.onScreenResize);
    }

    protected onScreenResize(): void {
        if (this.isHide) {
            this.resetSideMenu();
        }
    }

    protected getPosShow() {
        return cc.v2(this.menuShowPos.x, this.menuShowPos.y);
    }

    protected getPosHide() {
        return cc.v2(this.menuShowPos.x - this.frameWidth - gaScreenUtils.getNotchSize(), this.menuShowPos.y);
    }

    resetSideMenu() {
        this.unschedule(this.transitionMenu);
        this.isHide = true;
        this.overlay && (this.overlay.active = false);
        this.btnShow.active = true;
        this.btnHide.active = false;
        this.nodeMove.active = false;
        this.nodeMove.stopAllActions();
        this.nodeMove.setPosition(this.getPosHide());
        this.isActionDone = true;
    }

    onInfoClick() {
        if (!this.isActionDone) {
            return;
        }
        this.soundPlayer.playSFXClick();
        this.emit(gaEventsCode.POPUP.SHOW_POPUP_INFO);
        this.unscheduleAllCallbacks();
        this.transitionMenu();
    }

    onSettingClick() {
        if (!this.isActionDone) {
            return;
        }
        this.soundPlayer.playSFXClick();
        this.emit(gaEventsCode.POPUP.SHOW_POPUP_SETTING);
        this.unscheduleAllCallbacks();
        this.transitionMenu();
    }

    onHistoryBetClick(): void {
        if (!this.isActionDone) {
            return;
        }
        this.soundPlayer.playSFXClick();
        this.emit(gaEventsCode.POPUP.SHOW_POPUP_HISTORY_BET);
        this.unscheduleAllCallbacks();
        this.transitionMenu();
    }

    onHistoryJPClick(): void {
        if (!this.isActionDone) {
            return;
        }
        this.soundPlayer.playSFXClick();
        this.emit(gaEventsCode.POPUP.SHOW_POPUP_HISTORY_JP);
        this.unscheduleAllCallbacks();
        this.transitionMenu();
    }

    onExitGameClick(): void {
        this.soundPlayer.playSFXClick();
        this.emit(gaEventsCode.ACTION.LEAVE_GAME);
    }

    transitionMenu(evt?: cc.Event.EventTouch) {
        if (!this.isActionDone) {
            return;
        }
        if (evt) { // for click button menu
            this.soundPlayer.playSFXClick();
        }
        this.unschedule(this.transitionMenu);
        this.isActionDone = false;
        this.isHide = !this.isHide;
        this.btnShow.active = this.isHide;
        this.btnHide.active = !this.isHide;
        let pos: number | cc.Vec2;
        let actionDone = null;
        if (this.isHide) {
            pos = this.getPosHide();
            this.playFadeOutOverlay();
            actionDone = ()=>{
                this.isActionDone = true;
                this.resetSideMenu();
            }
        }
        else {
            pos = this.getPosShow();
            this.scheduleOnce(this.transitionMenu, 3);
            this.playFadeInOverlay();
            this.nodeMove.active = true;
            actionDone = ()=>{
                this.isActionDone = true;
            }

        }
        let baseEasing = this.isHide ? cc.easeSineIn() : cc.easeSineOut();
        this.nodeMove.stopAllActions();
        this.nodeMove.runAction(cc.sequence(
            cc.moveTo(0.3, pos).easing(baseEasing),
            cc.callFunc(actionDone)
        ));
    }

    playFadeInOverlay() {
        if (this.overlay) {
            this.overlay.active = true;
            this.overlay.stopAllActions();
            this.overlay.runAction(
                cc.fadeTo(0.3, this.OPACITY_SHOW_OVERLAY)
            );
        }
    }

    playFadeOutOverlay() {
        if (this.overlay) {
            this.overlay.stopAllActions();
            this.overlay.runAction(
                cc.sequence(
                    cc.fadeOut(0.3),
                    cc.callFunc(() => {
                        this.overlay.active = false;
                    })
                )
            );
        }
    }
}
