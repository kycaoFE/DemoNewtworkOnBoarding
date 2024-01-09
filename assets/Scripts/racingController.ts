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

    private buffalosOderFinish: Array<any> = [];


    // LIFE-CYCLE CALLBACKS:

    start () {

    }

    racing(){ 
        this.buffalosOderFinish = Data.instance.getOderFinish().split('');
        gaEventEmitter.instance.emit('racing', this.buffalosOderFinish);
    }

}
