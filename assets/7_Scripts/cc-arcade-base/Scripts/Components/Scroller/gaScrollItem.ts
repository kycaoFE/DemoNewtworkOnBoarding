import gaComponent from "../gaComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaScrollItem extends cc.Component {

    @property(cc.Label)
    textLabel: cc.Label = null

    value: number = 0;

    setLabelStr(str: string) {
        this.textLabel.string = str;
    }
}
