import gaBaseConfig from "../../Config/gaBaseConfig";
import gaMultipagePopups from "./gaMultipagePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaPopupHelpInfo extends gaMultipagePopups {
    get popupType(): string { return gaBaseConfig.POPUP_TYPE.HELP; }
}
