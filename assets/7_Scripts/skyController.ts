import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node) clouds: cc.Node[] = [];

    @property(cc.Node) startPos: cc.Node = null;
    @property(cc.Node) endPos: cc.Node = null;

    private speeds: Array<number> = [30, 30, 20, 20, 10, 10];

    start () {
        // gaEventEmitter.instance.registerEvent('racingDone', this.resetCloudPos.bind(this));
        this.clouds.forEach((cloud, index) => {
            this.startPos[index]= cloud.x;
        });
    }

    update (dt: number) {
        this.cloudMoving(dt);
        this.resetCloudPos();
    }

    cloudMoving(dt: number){
        this.clouds.forEach((cloud, index) => {
            cloud.x += this.speeds[index]*dt;
        });
    }

    resetCloudPos(){
        this.clouds.forEach((cloud, index) => {
            if(cloud.x > this.endPos.x){
                cloud.x = this.startPos.x;
            }
        });
    }
}
