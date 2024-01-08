import { Data, ccData } from "./data";
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node) buffalos: cc.Node[] = [];
    @property(cc.Label) distanceLabel: cc.Label = null;
    @property(cc.Node) finishLine: cc.Node = null;

    @property minDuration: number = 10;
    @property xEnd: number = 4600; 

    private buffalosOderFinish: Array<number> = [];


    // LIFE-CYCLE CALLBACKS:

    start () {

    }

    racing(callback: Function){
        this.buffalosOderFinish = Data.instance.getOderFinish().split('');
        cc.warn(this.buffalosOderFinish);
        gaEventEmitter.instance.emit('racing', this.buffalosOderFinish[0]);
        this.buffalosOderFinish.forEach((element, index) => {
            this.buffaloMoving(element, index, callback);
        });
    }

    buffaloMoving(buffaloNumber: number, buffaloIndexFinish: number, callback: Function){
        const duration = this.randomDuration(buffaloIndexFinish);
        const action = cc.sequence(
            cc.moveTo(duration, this.xEnd, this.buffalos[buffaloNumber-1].y),
            cc.callFunc(()=>{
                if (buffaloIndexFinish == 5){
                    callback();
                }
            })
        )
        this.buffalos[buffaloNumber-1].runAction(action);
    }

    randomDuration(oder: number){
        const min = 10 + oder;
        const max = 10 + oder + 0.5
        return Math.random() * (max - min) + min;
    }

    resetRacing(){
        this.buffalos.forEach(element => {
            element.x = -400;
        });
    }

}
