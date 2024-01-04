import gaBaseConfig from "../../Config/gaBaseConfig";
import gaEventsCode from "../../Definitions/gaEventsCode";
import gaComponent from "../gaComponent";
import gaBasePopup from "./gaBasePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaPopupController extends gaComponent {

    @property(cc.Node) overlay: cc.Node = null;
    @property(cc.Prefab) prefabPopups: cc.Prefab[] = [];

    popups: Map<string, gaBasePopup> = new Map();

    _listPopupIgnoreCloseByOverlay: gaBasePopup[] = [];

    _popupQueue: gaBasePopup[] = [];

    OPACITY_SHOW_OVERLAY: number = 150;

    protected onLoad(): void {
        super.onLoad();

        for (let i = 0; i < this.prefabPopups.length; i++) {
            const prefab = this.prefabPopups[i];
            const popupNode = cc.instantiate(prefab);
            const popup = popupNode.getComponent(gaBasePopup);
            this.node.addChild(popupNode);
            this.popups.set(popup.popupType, popup);
            popupNode.active = false;
            popupNode.zIndex = popup.zIndex;
        }
        this.overlay.zIndex = 0;
        this.overlay.active = false;
        this.node.opacity = 255;
        this.setupPopupIgnoreCloseByOverlay();
        this.registerEventOverlay();
    }

    protected setupPopupIgnoreCloseByOverlay(): void {
        this._listPopupIgnoreCloseByOverlay.push(this.popups.get(gaBaseConfig.POPUP_TYPE.DIALOG));
    }

    protected registerEventOverlay(): void {
        this.overlay.on(cc.Node.EventType.TOUCH_END, () => {
            this.closePopupByOverlay();
        }, this);
    }

    protected initEvents(): void {
        this.register(gaEventsCode.POPUP.SHOW_POPUP_HISTORY_BET, this.showHistoryBet);
        this.register(gaEventsCode.POPUP.SHOW_POPUP_HISTORY_JP, this.showHistoryJackpot);
        this.register(gaEventsCode.POPUP.SHOW_POPUP_INFO, this.showHelpInfo);
        this.register(gaEventsCode.POPUP.SHOW_POPUP_SETTING, this.showSetting);
        this.register(gaEventsCode.POPUP.CLOSE_TOP_POPUP, this.closeTopPopup);
        this.register(gaEventsCode.POPUP.SHOW_DIALOG, this.showDialog);
        this.register(gaEventsCode.POPUP.SHOW_TOAST, this.showToast);
        this.register(gaEventsCode.POPUP.CLOSE_POPUP, this.closePopup);
    }

    showHistoryBet() {
        this.show(gaBaseConfig.POPUP_TYPE.HISTORY_BET);
    }

    showHistoryJackpot() {
        this.show(gaBaseConfig.POPUP_TYPE.HISTORY_JP);
    }

    showHelpInfo() {
        this.show(gaBaseConfig.POPUP_TYPE.HELP);
    }

    showSetting() {
        this.show(gaBaseConfig.POPUP_TYPE.SETTING);
    }

    showDialog(data) {
        this.show(gaBaseConfig.POPUP_TYPE.DIALOG, data);
    }

    show(pType: string, data: any = null, addQueue: boolean = true): void {
        if (pType === "") {
            return;
        }
        var currentPopup = this.popups.get(pType);
        if (!currentPopup) return;
        currentPopup.show(data);
        if (addQueue) {
            this.onPopupQueue(currentPopup);
        }
    }

    onPopupQueue(popup: gaBasePopup) {
        let isNew = false;
        if (this._popupQueue && this._popupQueue.length > 0) {
            const currPopup = this._popupQueue[this._popupQueue.length - 1];
            if (currPopup != popup) {
                this._popupQueue[this._popupQueue.length - 1].hide();
                isNew = true;
            }
        } else {
            this.overlay.active = true;
            this.overlay.stopAllActions();
            this.overlay.runAction(
                cc.fadeTo(0.3, this.OPACITY_SHOW_OVERLAY)
            );
            isNew = true;
        }
        if (isNew) {
            this._popupQueue.push(popup);
        }
    }

    closePopupByOverlay(): void {
        if (this._popupQueue && this._popupQueue.length > 0) {
            const currPopup = this._popupQueue[this._popupQueue.length - 1];
            if (this._listPopupIgnoreCloseByOverlay.indexOf(currPopup) > -1) {
                return;
            }
            this.closeTopPopup();
        }
    }

    closePopup(data: any): void {
        const { type } = data;
        if (this.isPopupShown(type)) {
            this.closeTopPopup();
        }
    }

    closeTopPopup() {
        const popup = this._popupQueue.pop();
        if (popup == null) {
            return;
        }
        popup.hide();
        if (this._popupQueue.length < 1) {
            this.playFadeOutOverlay();
            return;
        }
        this._popupQueue[this._popupQueue.length - 1].show();
    }

    playFadeOutOverlay() {
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

    hide(pType: string): void {
        if (pType === "") {
            return;
        }
        var currentPopup = this.popups.get(pType);
        if (!currentPopup) return;
        currentPopup.hide();
    }

    hideAll(): void {
        if (this._popupQueue.length > 0) {
            this.closeTopPopup();
            this.hideAll();
        }
    }

    isAnyPopupShown(): boolean {
        this.popups.forEach((popup, key) => {
            if (popup.isShowing) {
                return true;
            }
        })
        return false;
    }

    isPopupShown(pType: string): boolean {
        const popup = this.popups.get(pType);
        return popup && popup.isShowing;
    }

    public showToast(data: { message: string, duration: number }): void {
        if (!this.isPopupShown(gaBaseConfig.POPUP_TYPE.TOAST)) {
            this.show(gaBaseConfig.POPUP_TYPE.TOAST, data, false);
        }
    }
}
