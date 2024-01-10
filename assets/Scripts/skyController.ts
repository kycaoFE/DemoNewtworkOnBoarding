import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node) clouds: cc.Node[] = [];

    private startPos: Array<number> = [];

    private speeds: Array<number> = [10, 20, 40];

    start () {
        gaEventEmitter.instance.registerEvent('racingDone', this.resetCloudPos.bind(this));
        this.clouds.forEach((cloud, index) => {
            this.startPos[index]= cloud.x;
        });
    }

    update (dt: number) {
        this.cloudMoving(dt);
    }

    cloudMoving(dt: number){
        this.clouds.forEach((cloud, index) => {
            cloud.x += this.speeds[index]*dt;
        });
    }

    resetCloudPos(){
        this.clouds.forEach((cloud, index) => {
            cloud.x = this.startPos[index];
        });
    }
}
