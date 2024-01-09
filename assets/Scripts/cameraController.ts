import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private isRacing: boolean = false;
    @property(cc.Node) target: cc.Node = null;
    @property(cc.Node) buffalos: cc.Node[] = [];

    private isFollow: boolean = false;
    onLoad() {
        gaEventEmitter.instance.registerEvent('racing', () => { this.isRacing = true });
    }

    start() {

    }

    update(dt: number) {
        if (!this.isRacing) return;
        this.target = this.getFirstBuffalo();
        if (this.target.x > 0) this.isFollow = true;
        else this.isFollow = false;
        if (this.isFollow) {
            let targetPosition = new cc.Vec2(this.target.x, 0)
            this.node.setPosition(targetPosition);
        }
    }

    getFirstBuffalo() {
        var firstBuffalo = this.buffalos[1];
        this.buffalos.forEach(element => {
            if (element.x > firstBuffalo.x) {
                firstBuffalo = element;
            }
        });
        return firstBuffalo;
    }

}
