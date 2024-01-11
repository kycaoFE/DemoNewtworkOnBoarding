import gaBaseConfig from "../../Config/gaBaseConfig";
import gaToggleDoubleCheckmark from "../UserUI/gaToggleDoubleCheckmark";
import gaBasePopup from "./gaBasePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupSetting extends gaBasePopup {
    @property(cc.Toggle)
    BGMCheckBox: cc.Toggle = null;

    @property(cc.Toggle)
    SFXCheckBox: cc.Toggle = null;

    get popupType(): string { return gaBaseConfig.POPUP_TYPE.SETTING; }

    isInit: boolean = false;

    initObj() {
        super.initObj();
        this.isInit = true;
        this.SFXCheckBox.isChecked = this.soundPlayer.isEnableSFX;
        this.BGMCheckBox.isChecked = this.soundPlayer.isEnableBGM;
        this.loadDefault();

        this.BGMCheckBox.node.off('toggle');
        this.SFXCheckBox.node.off('toggle');
        this.BGMCheckBox.node.on('toggle', this.onToggleMusic, this);
        this.SFXCheckBox.node.on('toggle', this.onToggleSound, this);
    }

    loadDefault(): void {
        const ls = [this.BGMCheckBox.node, this.SFXCheckBox.node];
        const states = [this.soundPlayer.isEnableBGM, this.soundPlayer.isEnableSFX];
        ls.forEach((it, index) => {
            const doubleCheckMark = it.getComponent(gaToggleDoubleCheckmark);
            if (doubleCheckMark) {
                doubleCheckMark.init(states[index]);
            }
        })
    }

    onToggleSound() {
        if (!this.isInit) {
            return;
        }
        this.soundPlayer.setEffectEnable(this.SFXCheckBox.isChecked);
        this.soundPlayer.playSFXClick();
    }

    onToggleMusic() {
        if (!this.isInit) {
            return;
        }
        this.soundPlayer.setBgmEnable(this.BGMCheckBox.isChecked);
        this.soundPlayer.playSFXClick();
    }

}
