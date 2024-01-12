import { Data, ccData } from "./data";
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node) buffalos: cc.Node[] = [];
    @property(cc.Label) distanceLabel: cc.Label = null;
    @property(cc.Node) finishLine: cc.Node = null;
    @property(cc.Label) countDownLabel: cc.Label = null;

    @property minDuration: number = 10;
    @property labelString: any = {
        value: 3
    };

    private buffalosOderFinish: Array<any> = [];


    protected onLoad(): void {
        gaEventEmitter.instance.registerEvent('nextRound', this.resetRacing.bind(this));
        gaEventEmitter.instance.registerEvent('racingPrepareDone', this.countDownStart.bind(this))
    }
    protected update(dt: number): void {
        this.countDownLabel.string = Math.round(this.labelString.value).toString();
    }

    start () {
        this.countDownLabel.node.active = false;
    }

    racing(){ 
        this.buffalosOderFinish = Data.instance.getOderFinish().split('');
        gaEventEmitter.instance.emit('racingPrepare');
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
            this.countDownLabel.node.active = false;
        })
        .start();
 
    }

    resetRacing(){

    }

}
