import { Data, ccData } from "./data";
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(sp.Skeleton) skeletonAnim: sp.Skeleton = null;

    private buffaloNumber: string;
    private oderFinish: number;
    private xStart: number;
    private xFinish: number;
    private minDuration: number;

    protected onLoad(): void {
        this.skeletonAnim = this.node.getComponent(sp.Skeleton);
        this.xFinish = Data.instance.xFinish;
        this.xStart = Data.instance.xStart;
        this.minDuration = Data.instance.minDuration;
        cc.warn(this.xFinish, this.xStart);
        this.buffaloNumber = this.node.name;
        gaEventEmitter.instance.registerEvent("racing", this.run.bind(this));
        gaEventEmitter.instance.registerEvent('prepareNextRound', this.prepareNextRound.bind(this));
    }
    start() {
        this.idle();
    }

    run(data: any) {
        this.skeletonAnim.setAnimation(0, 'run', true);
        this.oderFinish = data.indexOf(this.buffaloNumber);
        const timeChangeSpeed = Math.floor(this.randomMinMax(3, 5));
        const durations = this.randomDurations(this.oderFinish, timeChangeSpeed);
        const distances = this.randomDistance(timeChangeSpeed);
        var _delay = 0;
        durations.forEach((duration, index) => {
            const delay = (index > 0) ? duration : 0;
            _delay += delay;
            this.buffaloAction(_delay, distances[index], durations[index]);
        });
    }
    randomDurations(oder: number, timeChangeSpeed: number) {
        const durations = [];
        var min = 0;
        var max = this.minDuration + oder * 0.1;
        for (let i = 1; i <= timeChangeSpeed; i++) {
            durations.push((max - min) / timeChangeSpeed);
        }
        return durations;
    }

    randomDistance(timeChangeSpeed: number) {
        const distances = [];
        var startPos = this.xStart;
        const stepPos = (this.xFinish - this.xStart) / timeChangeSpeed;
        for (let i = 1; i <= timeChangeSpeed; i++) {
            if (i === timeChangeSpeed) {
                distances.push(this.xFinish);
                break;
            }
            let posBuffalo = this.randomMinMax(
                startPos + (5 * stepPos) / 6,
                startPos + stepPos
            );
            distances.push(posBuffalo);
            startPos = posBuffalo;
        }
        return distances;
    }

    buffaloAction(delay: number, distance: number, duration: number) {
        cc.tween(this.node)
            .delay(delay)
            .to(duration, { x: distance })
            .call(() => {
                if (distance == this.xFinish) {
                    this.idle();
                    if (this.oderFinish == 5) {
                        gaEventEmitter.instance.emit("racingDone");
                        this.resetStats();
                    }
                }
            })
            .start();
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
