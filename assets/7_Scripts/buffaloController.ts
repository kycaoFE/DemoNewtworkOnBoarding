import { Data, ccData } from "./data";
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuffaloController extends cc.Component {
    @property(sp.Skeleton) skeletonAnim: sp.Skeleton = null;

    private buffaloNumber: string;
    private oderFinish: number;
    private xFinish: number;
    public speed: number = 0;
    private speedCurrent: Array<number> = [];
    private durationFinish: number = 0;
    private isIdle: boolean = true;
    private timeChangeSpeed: number = 0;
    private _timeChangeSpeed: number = 0;
    private numChangeSpeed: number = 0;

    private distance: number = 0;

    private speedBase: Array<number> = [0.8, 0.9, 1.0, 1.1, 1.2];
    private timeTrans: number;
    private isTrans: boolean = false;

    protected onLoad(): void {
        gaEventEmitter.instance.registerEvent("racing", this.run.bind(this));
        gaEventEmitter.instance.registerEvent('prepareNextRound', this.prepareNextRound.bind(this));
    }
    start() {
        this.skeletonAnim = this.node.getComponent(sp.Skeleton);
        this.xFinish = Data.instance.xFinish;
        this.buffaloNumber = this.node.name;
        this.idle();
        this.skeletonAnim.findSlot('giftbox').setAttachment("", "");
        this.schedule(this.checkAnimationStatus, 0.05);
        this.timeTrans = this.skeletonAnim.findAnimation('run_trans_idle').duration;
    }

    protected update(dt: number): void {
        if (this.isIdle) return;
        this.node.x += this.speed * dt;
        this.changeSpeed(dt);
        if (this.isTrans) {
            this.isIdle = true;
        }
    }

    run(data: any) {
        this.oderFinish = Data.instance.getOderBuffalo(this.buffaloNumber);
        this.distance = Data.instance.racingDistance;
        this.durationFinish = Data.instance.minDuration + this.oderFinish * 0.2;
        this.speedCurrent = this.randomSpeed();
        this.numChangeSpeed = 0;
        this.speed = (this.distance / this.durationFinish) * this.speedCurrent[this.numChangeSpeed];
        this.timeChangeSpeed = this.durationFinish / 5;
        this._timeChangeSpeed = this.timeChangeSpeed;
        this.skeletonAnim.setAnimation(0, 'idle_trans_run', false);
        this.skeletonAnim.addAnimation(0, 'run', true);
        this.isIdle = false;
        this.isTrans = false;
    }

    changeSpeed(dt: number) {
        this._timeChangeSpeed -= dt;
        if (this._timeChangeSpeed > 0 || this.numChangeSpeed > 4) return;
        this.numChangeSpeed++;
        this.speed = (this.distance / this.durationFinish) * this.speedCurrent[this.numChangeSpeed];
        this.skeletonAnim.timeScale = this.speedCurrent[this.numChangeSpeed];
        this._timeChangeSpeed = this.timeChangeSpeed;
    }

    randomMinMax(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    prepareNextRound() {
        this.skeletonAnim.setAnimation(0, 'walk_trans_idle', false);

        cc.tween(this.node)
            .to(Data.instance.timePrepare, { x: 4900 })
            .call(() => {
                this.idle();
                this.node.x = Data.instance.xStart;
            })
            .start();
    }

    idle() {
        const idleName = `idle` + Math.floor(this.randomMinMax(1, 4));
        this.skeletonAnim.addAnimation(0, idleName, true);
    }

    randomSpeed() {
        const speeds = this.speedBase;
        return speeds.sort(() => {
            return Math.random() - 0.5;
        })
    }

    transToStop() {
        this.skeletonAnim.addAnimation(0, 'run_trans_idle', false);
        cc.tween(this.node)
            .to(this.timeTrans + 0.05, { x: this.xFinish })
            .call(() => {
                this.idle();
                if (this.oderFinish == 5) {
                    gaEventEmitter.instance.emit("racingDone");
                }
            })
            .start()
    }

    checkAnimationStatus() {
        if (this.isIdle) return;
        const trackEntry = this.skeletonAnim.getCurrent(0);
        if (trackEntry.isComplete) {
            if (trackEntry.animation.name == 'run' && this.node.x >= this.xFinish - this.speed * this.timeTrans && !this.isTrans) {
                this.isTrans = true;
                this.transToStop();
            }
        }
    }
}
