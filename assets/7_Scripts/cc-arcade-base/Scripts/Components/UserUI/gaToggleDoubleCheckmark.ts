import gaComponent from "../gaComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaToggleDoubleCheckmark extends gaComponent {

    @property(cc.Node)
    spriteOn: cc.Node = null;

    @property(cc.Node)
    spriteOff: cc.Node = null;

    isChecked: boolean = false;
    protected onLoad(): void {
        this.node.on("click", this.onToggle, this);
    }

    public init(state: boolean): void {
        this.isChecked = state;
        this.setToggle();
    }

    onToggle() {
        this.isChecked = !this.isChecked;
        this.setToggle();
    }

    setToggle() {
        this.spriteOn.active = this.isChecked;
        this.spriteOff.active = !this.isChecked;
    }
}
