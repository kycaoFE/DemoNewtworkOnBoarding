import gaBaseConfig from "../../Config/gaBaseConfig";
import gaBasePopup from "./gaBasePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaToast extends gaBasePopup {
    get popupType(): string { return gaBaseConfig.POPUP_TYPE.TOAST; };
    
    @property(cc.Label)
    txtMessage: cc.Label = null;

    show(data: any = null): void {
        if (!data || !this.txtMessage) return;
        super.show(data);
        this.txtMessage.string = data.message;
        const duration = data.duration;
        if (duration == null) {
            data.duration = 2;
        }
        if (duration > 0) {
            this.scheduleOnce(this.hide, duration)
        }
    }
}
