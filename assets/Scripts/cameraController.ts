import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private isRacing: boolean = false;
    @property(cc.Node) target: cc.Node = null;
    @property(cc.Node) buffalos: cc.Node[] = [];
    @property(cc.Node) layers: cc.Node[] = [];
    @property(cc.Node) buffalosPool: cc.Node = null;

    private speeds: Array<number> = [0.9, 0.6, 0.4];
    private isFollow: boolean = false;
    onLoad() {
        gaEventEmitter.instance.registerEvent('racing', () => { this.isRacing = true });
        gaEventEmitter.instance.registerEvent('racingPrepare', this.prepare.bind(this));
        gaEventEmitter.instance.registerEvent('nextRound', ()=>{ 
            this.setPosBackground(0);
            this.isRacing = false});
    }

    start() {

    }

    update(dt: number) {
        this.setPosBackground(this.node.x);
        if (!this.isRacing) return;
        this.target = this.getFirstBuffalo();
        if (this.node.x < 4000){
            let targetPosition = new cc.Vec2(this.target.x+this.buffalosPool.x - 200, 0)
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

    setPosBackground(pos: number){
        this.layers.forEach((layer, index) => {
            layer.x = pos*this.speeds[index];
        });
    }

    prepare(){
        cc.tween(this.node)
        .to(1, {x: this.buffalos[0].x+this.buffalosPool.x-200})
        .call(()=>{
            gaEventEmitter.instance.emit('racingPrepareDone');
        })
        .start();
    }

}
