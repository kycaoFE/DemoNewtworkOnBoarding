import { Data, ccData } from "./data";
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(sp.Skeleton) skeletonAnim: sp.Skeleton = null;

    private buffaloNumber: string;
    private oderFinish: number;
    private xFinish: number;
    public speed: number = 0;
    private durationFinish: number = 0;
    private isIdle: boolean = true;
    private timeChangeSpeed : number = 0;
    private _timeChangeSpeed : number = 0;
    private xCurrent: number = 0;
    private distance: number =0;

    protected onLoad(): void {
        gaEventEmitter.instance.registerEvent("racing", this.run.bind(this));
        gaEventEmitter.instance.registerEvent('prepareNextRound', this.prepareNextRound.bind(this));
    }
    start() {
        this.skeletonAnim = this.node.getComponent(sp.Skeleton);
        this.xFinish = Data.instance.xFinish;
        this.buffaloNumber = this.node.name;
        this.idle();
    }

    protected update(dt: number): void {
        if(this.isIdle) return;
        this.node.x += this.speed * dt;
        this.changeSpeed(dt);
        if(this.node.x >= this.xFinish) {
            this.isIdle = true;
            this.idle();
            this.speed = 0;
            if(this.oderFinish == 5) {
                gaEventEmitter.instance.emit("racingDone");
            }
        }
    }

    run(data: any) {
        this.isIdle = false;
        this.skeletonAnim.setAnimation(0, 'idle_trans_run', false);
        this.skeletonAnim.addAnimation(0, 'run', true);

        this.oderFinish = data.indexOf(this.buffaloNumber);

        this.durationFinish = Data.instance.minDuration + this.oderFinish*0.5;
        this.distance = Data.instance.racingDistance;
        this.xCurrent = this.node.x;
        this.speed = this.distance/this.durationFinish;
        this.timeChangeSpeed = this.durationFinish/this.randomMinMax(3,5);
        this._timeChangeSpeed = this.timeChangeSpeed;
    }

    changeSpeed(dt: number){
        this._timeChangeSpeed -=dt;
        if(this._timeChangeSpeed <= 0 && this.durationFinish >= this.timeChangeSpeed){
            this.durationFinish -= this.timeChangeSpeed;
            this.distance -= this.node.x - this.xCurrent;
            this.speed = (this.distance/this.durationFinish)*this.randomMinMax(0.8, 1.2);
            this._timeChangeSpeed = this.timeChangeSpeed;
            this.xCurrent = this.node.x;
        }
    }

    randomMinMax(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    resetStats() {
        this.oderFinish = null;
    }

    prepareNextRound() {
        this.skeletonAnim.setAnimation(0, 'walk', true);

        cc.tween(this.node)
            .by(1, { x: 240 })
            .call(() => {
                this.idle();
                this.node.x = Data.instance.xStart;
            })
            .start();
    }

    idle() {
        const idleName = `idle` + Math.floor(this.randomMinMax(1, 4));
        this.skeletonAnim.setAnimation(0, idleName, true);
    }

}
