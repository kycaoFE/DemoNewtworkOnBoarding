import { Data, ccData } from "./data";
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node) buffalos: cc.Node[] = [];
    @property(cc.Label) distanceLabel: cc.Label = null;
    @property(cc.Node) finishLine: cc.Node = null;
    @property(cc.Label) countDownLabel: cc.Label = null;
    @property(cc.Node) layers: cc.Node[] = [];


    @property minDuration: number = 10;
    @property labelString: any = {
        value: 3
    };

    private layerSpeed: Array<number> = [0.6, 0.8];
    private oversteer: number = 300;
    private distanceScroll = 800;
    private distanceScrollPrepare = 240;
    private uiPosition = 50;
    private isRacing : boolean = false;

    private buffalosOderFinish: Array<any> = [];


    protected onLoad(): void {
        gaEventEmitter.instance.registerEvent('prepareNextRound', this.resetRacing.bind(this));
        gaEventEmitter.instance.registerEvent('racingPrepareDone', this.countDownStart.bind(this))
        gaEventEmitter.instance.registerEvent('racingDone', ()=>{
            this.isRacing = false;
        })
    }
    protected update(dt: number): void {
        this.countDownLabel.string = Math.round(this.labelString.value).toString();
        if(!this.isRacing || this.node.x <= - Data.instance.racingDistance - 200 || this.getFastestBuffalo().x <= 0) return;
        const speed = this.getFastestBuffalo().getComponent('buffaloController').speed
        this.node.x -=  speed* dt;
        this.layers.forEach((layer, index) => {
            layer.x -= this.layerSpeed[index]*speed * dt;
        });
    }

    start () {
        this.countDownLabel.node.active = false;
    }

    racing(){ 
        this.buffalosOderFinish = Data.instance.getOderFinish().split('');
        this.prepare();
        // gaEventEmitter.instance.emit('racingPrepare');
    }

    getFastestBuffalo(){
        var fastestBuffalo = this.buffalos[0];
        this.buffalos.forEach(buffalo => {
            if(buffalo.x > fastestBuffalo.x){
                fastestBuffalo = buffalo;
            }
        });
        return fastestBuffalo;
    }

    prepare() {
        const durationPrepare = 1;
        cc.tween(this.node)
            .by(durationPrepare, { x: -this.distanceScroll })
            .call(() => {
                gaEventEmitter.instance.emit('racingPrepareDone');
            })
            .start();
        this.layers.forEach((layer, index) => {
            cc.tween(layer)
            .by(durationPrepare, { x: -this.distanceScroll * this.layerSpeed[index] -200 })
            .start();
        });
    }

    countDownStart(){
        const time = 3;
        this.countDownLabel.node.active = true;
        this.labelString = {
            value: time
        }
        cc.tween(this.labelString)
        .to(3,{value: 0})
        .call(()=>{
            gaEventEmitter.instance.emit('racing', this.buffalosOderFinish);
            cc.warn('numBuffalo', this.buffalosOderFinish);
            this.isRacing = true;
            this.countDownLabel.node.active = false;
        })
        .start();
 
    }

    resetRacing(){
        cc.tween(this.node)
        .by(1,{x: -240})
        .call(()=>{
            this.node.x = -200;
        })
        .start();
    }

}
