import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    private isRacing: boolean = false;
    @property(cc.Node) target: cc.Node = null;
    @property(cc.Node) buffalos: cc.Node[] = [];
    @property(cc.Node) layers: cc.Node[] = [];

    private speeds: Array<number> = [0.8, 0.6, 0.4];
    private isFollow: boolean = false;
    onLoad() {
        gaEventEmitter.instance.registerEvent('racing', () => { this.isRacing = true });
        gaEventEmitter.instance.registerEvent('racingPrepare', this.prepare.bind(this));
        gaEventEmitter.instance.registerEvent('racingDone', ()=>{ 
            this.setPosBackground(0);
            this.isRacing = false});
    }

    start() {

    }

    update(dt: number) {
        if (!this.isRacing) return;
        this.target = this.getFirstBuffalo();
        cc.warn('targetX', this.target.x);
        if (this.target.x > 0) this.isFollow = true;
        else this.isFollow = false;
        if (this.isFollow) {
            let targetPosition = new cc.Vec2(this.target.x+750, 0)
            this.node.setPosition(targetPosition);
            this.setPosBackground(this.node.x);
            
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
        .to(3, {x: 700})
        .call(()=>{
            gaEventEmitter.instance.emit('racingPrepareDone');
        })
        .start();
    }

}
