import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private isRacing: boolean = false;
    @property(cc.Node) target: cc.Node = null;
    @property(cc.Node) buffalos: cc.Node[] = [];
    @property(cc.Node) layers: cc.Node[] = [];
    @property(cc.Node) buffalosPool: cc.Node = null;
    @property(cc.Node) ui: cc.Node = null;
    @property(cc.Node) sky: cc.Node = null;

    private speeds: Array<number> = [0.6, 0.4];
    private isFollow: boolean = false;
    onLoad() {
        gaEventEmitter.instance.registerEvent('racing', () => { this.isRacing = true });
        gaEventEmitter.instance.registerEvent('racingPrepare', this.prepare.bind(this));
        gaEventEmitter.instance.registerEvent('prepareNextRound', this.nextRound.bind(this));
    }

    start() {

    }

    update(dt: number) {
        this.setPosBackground(this.node.x);
        if (!this.isRacing) return;
        this.target = this.getFirstBuffalo();
        if (this.target.x+this.buffalosPool.x -200 >= this.node.x && this.node.x < 5060){
            let targetPosition = new cc.Vec2(this.target.x+this.buffalosPool.x -200, 0)
            this.node.setPosition(targetPosition);
            this.ui.x = this.node.x - 850;
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

    setPosBackground(pos: number){
        this.layers.forEach((layer, index) => {
            layer.x = pos*this.speeds[index];
        });
    }

    prepare(){
        cc.tween(this.node)
        .to(1, {x: 800})
        .call(()=>{
            gaEventEmitter.instance.emit('racingPrepareDone');
        })
        .start();
    }

    nextRound(){
        cc.tween(this.node)
        .to(1, {x: 5300})
        .to(0,{x: 0})
        .call(()=>{
            this.ui.x = -50;
            this.isRacing = false
            gaEventEmitter.instance.emit("nextRound");
        })
        .start();
        cc.tween(this.ui)
        .to(1, {x: 5250})
        .to(0, {x: -50})
        .start();
    }

}
