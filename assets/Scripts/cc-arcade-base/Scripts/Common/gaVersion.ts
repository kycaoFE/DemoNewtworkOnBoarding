import gaBaseConfig from "../Config/gaBaseConfig";
const {ccclass, property} = cc._decorator;

@ccclass
export default class gaVersion extends cc.Component {
    @property(cc.Label) versionText: cc.Label = null;
    
    protected onLoad(): void {
        this.versionText.string = gaBaseConfig.gameVersion;
    }
}