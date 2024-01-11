import gaBaseConfig from "../../Config/gaBaseConfig";
import { gameCommonUtils } from "../../Definitions/gaCommon";
import gaBasePopup from "./gaBasePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaDialog extends gaBasePopup {
    @property(cc.Label)
    txtMessage: cc.Label = null;

    @property(cc.Node)
    btnConfirm: cc.Node = null;

    @property(cc.Node)
    btnReject: cc.Node = null;

    get popupType(): string { return gaBaseConfig.POPUP_TYPE.DIALOG; }

    confirmHdl: Function = null;
    typeShowing: string = '';

    show(data: any): void {
        const { POPUP_PROMPT } = gaBaseConfig.instance;
        if (!data || !this.txtMessage || this.typeShowing == POPUP_PROMPT.ERROR_NETWORK || this.typeShowing == POPUP_PROMPT.SOCKET_DISCONNECT) return;

        this.resetDialog();
        this.onResetState();
        const { type, message, onConfirm, onReject } = data;
        this.txtMessage.string = message;
        this.typeShowing = type;
        switch (type) {
            case POPUP_PROMPT.ERROR_NETWORK:
                this.btnClose && (this.btnClose.node.active = false);
                this.btnReject && (this.btnReject.active = false);
                this.btnConfirm.active = gameCommonUtils.checkConditionCloseGameIframe();
                if (this.btnConfirm.active) {
                    this.btnConfirm.off('click');
                    this.btnConfirm.on('click', () => {
                        this.btnConfirm.off('click');
                        this.soundPlayer && this.soundPlayer.playSFXClick();
                        if (onConfirm) {
                            this.confirmHdl = onConfirm;
                        }
                        this.onClose();
                    }, this);
                }
                break;
            case POPUP_PROMPT.JUST_CONFIRM_BUTTON:
                this.btnClose && (this.btnClose.node.active = false);
                this.btnReject && (this.btnReject.active = false);
                this.btnConfirm.active = true;
                this.btnConfirm.off('click');
                this.btnConfirm.on('click', () => {
                    this.btnConfirm.off('click');
                    this.soundPlayer && this.soundPlayer.playSFXClick();
                    if (onConfirm) {
                        this.confirmHdl = onConfirm;
                    }
                    this.onClose();
                }, this);
                break;
            case POPUP_PROMPT.CONFIRM_AND_CLOSE_BUTTON:
                this.btnClose && (this.btnClose.node.active = true);
                this.btnReject && (this.btnReject.active = false);
                this.btnConfirm.active = true;
                this.btnConfirm.off('click');
                this.btnConfirm.on('click', () => {
                    this.btnConfirm.off('click');
                    this.soundPlayer && this.soundPlayer.playSFXClick();
                    if (onConfirm) {
                        this.confirmHdl = onConfirm;
                    }
                    this.onClose();
                }, this);
                break;
            case POPUP_PROMPT.CONFIRM_AND_REJECT_BUTTON:
                this.btnClose && (this.btnClose.node.active = false);
                this.btnConfirm.active = true;
                this.btnConfirm.off('click');
                this.btnConfirm.on('click', () => {
                    this.btnConfirm.off('click');
                    this.soundPlayer && this.soundPlayer.playSFXClick();
                    if (onConfirm) {
                        this.confirmHdl = onConfirm;
                    }
                    this.onClose();
                }, this);

                if (this.btnReject) {
                    this.btnReject.active = true;
                    this.btnReject.off('click');
                    this.btnReject.on('click', () => {
                        this.btnReject.off('click');
                        this.soundPlayer && this.soundPlayer.playSFXClick();
                        if (onReject) {
                            this.confirmHdl = onReject;
                        }
                        this.onClose();
                    }, this);
                }
                break;
            default:
                this.btnClose && (this.btnClose.node.active = false);
                this.btnConfirm.active = false;
                this.btnReject && (this.btnReject.active = false);
                break;
        }
        super.show();
    }

    hide() {
        this.typeShowing = '';
        let actions = [];
        actions.push(cc.callFunc(() => {
            super.hide();
        }))
        if (this.confirmHdl) {
            actions.push(cc.callFunc(this.confirmHdl.bind(this)));
        }
        if (actions.length > 1) {
            this.contents.runAction(cc.sequence(actions));
        } else {
            this.contents.runAction(actions[0]);
        }
    }

    protected resetDialog(): void {
        this.typeShowing = '';
        this.btnConfirm.active = false;
        this.btnReject && (this.btnReject.active = false);
        this.btnClose && (this.btnClose.node.active = false);
        this.confirmHdl = null;
        this.unscheduleAllCallbacks();
    }
}
