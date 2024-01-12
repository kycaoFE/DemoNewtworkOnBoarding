import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
import { Data } from "./data";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node) target: cc.Node = null;
    @property(cc.Node) buffalos: cc.Node[] = [];
    @property(cc.Node) layers: cc.Node[] = [];
    @property(cc.Node) buffalosPool: cc.Node = null;
    @property(cc.Node) ui: cc.Node = null;
    @property(cc.Node) sky: cc.Node = null;

    private isRacing: boolean = false;
    private speeds: Array<number> = [20, 40];
    private oversteer: number = 300;
    private distanceScroll = 800;
    private distanceScrollPrepare = 240;
    private uiPosition = 50;

    onLoad() {
        gaEventEmitter.instance.registerEvent('racing', this.racing.bind(this));
        gaEventEmitter.instance.registerEvent('racingPrepare', this.prepare.bind(this));
        gaEventEmitter.instance.registerEvent('prepareNextRound', this.nextRound.bind(this));
    }

    update(dt: number) {
        if (!this.isRacing) return;
        this.target = this.getFirstBuffalo();
        if (this.target.x + this.buffalosPool.x - this.oversteer >= this.node.x && this.node.x < Data.instance.racingDistance) {
            let targetPosition = new cc.Vec2(this.target.x + this.buffalosPool.x - this.oversteer, 0)
            this.node.setPosition(targetPosition);
            this.ui.x = this.node.x - (this.distanceScroll + this.uiPosition);
            this.setPosBackground(dt)
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

    setPosBackground(dt) {
        this.layers.forEach((layer, index) => {
            layer.x -= this.speeds[index] * dt;
        });
    }

    prepare() {
        const durationPrepare = 1;
        cc.tween(this.node)
            .by(durationPrepare, { x: this.distanceScroll })
            .call(() => {
                gaEventEmitter.instance.emit('racingPrepareDone');
            })
            .start();
        this.layers.forEach((element, index) => {
            cc.tween(element)
                .by(durationPrepare, { x: - this.distanceScroll })
                .start();
        });
    }

    nextRound() {
        cc.tween(this.node)
            .by(1, { x: this.distanceScrollPrepare })
            .to(0, { x: 0 })
            .call(() => {
                this.ui.x = this.uiPosition;
                this.isRacing = false
                gaEventEmitter.instance.emit("nextRound");
            })
            .start();
        cc.tween(this.ui)
            .by(1, { x: this.distanceScroll+ this.distanceScrollPrepare })
            .to(0, { x: -this.uiPosition })
            .start();
    }

    racing() {
        this.isRacing = true
    }

}
