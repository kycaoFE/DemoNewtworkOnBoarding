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
    private speedCurrent: Array<number> = [];
    private distance: number =0;
    private numChangeSpeed: number = 0;
    private speeds: Array<number> = [0.8, 0.9, 1.0, 1.1, 1.2];

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
        this.oderFinish = Data.instance.getOderBuffalo(this.buffaloNumber);
        this.distance = Data.instance.racingDistance;
        this.durationFinish = Data.instance.minDuration + this.oderFinish * 0.2;
        this.speedCurrent = this.randomSpeed();
        this.numChangeSpeed = 0;
        this.speed = (this.distance/this.durationFinish)*this.speedCurrent[this.numChangeSpeed];
        this.timeChangeSpeed = this.durationFinish/5;
        this._timeChangeSpeed = this.timeChangeSpeed;
        this.isIdle = false;
        this.skeletonAnim.setAnimation(0, 'idle_trans_run', false);
        this.skeletonAnim.addAnimation(0, 'run', true);
        cc.warn(this.speedCurrent);
        
    }

    changeSpeed(dt: number){
        this._timeChangeSpeed -=dt;
        if(this._timeChangeSpeed > 0 || this.numChangeSpeed > 4) return;
        this.numChangeSpeed++;
        this.speed = (this.distance/this.durationFinish)*this.speedCurrent[this.numChangeSpeed];
        this._timeChangeSpeed = this.timeChangeSpeed;
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

    randomSpeed(){
        const speeds = this.speeds;
        return speeds.sort(() =>{  
            return Math.random() - 0.5
        })
    }

}
