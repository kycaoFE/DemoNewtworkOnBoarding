import { Data, ccData } from "./data";
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
const { ccclass, property } = cc._decorator;

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

    private distanceScroll = 800;
    private distanceScrollPrepare = 240;

    private isRacing: boolean = false;

    private buffalosOderFinish: Array<any> = [];
    private layerSpeed: Array<number> = [0.7, 0.9];


    protected onLoad(): void {
        gaEventEmitter.instance.registerEvent('prepareNextRound', this.prepareNextRound.bind(this));
        gaEventEmitter.instance.registerEvent('racingPrepareDone', this.countDownStart.bind(this))
        gaEventEmitter.instance.registerEvent('racingDone', () => {
            this.isRacing = false;
        })
    }

    start() {
        this.countDownLabel.node.active = false;
    }

    protected update(dt: number): void {
        if (this.countDownLabel.node.active) {
            this.countDownLabel.string = Math.round(this.labelString.value).toString();
        }
        if (!this.isRacing || this.node.x <= - Data.instance.racingDistance - 200 || this.getFastestBuffalo().x <= 0) return;

        const speed = this.getFastestBuffalo().getComponent('buffaloController').speed;

        this.node.x -= speed * dt;

        this.layers.forEach((layer, index) => {
            const distance = this.layerSpeed[index] * speed * dt
            layer.x -= distance;
            Data.instance.layerDistance[index] += distance;
        });
    }

    racing() {
        // this.buffalosOderFinish = Data.instance.getOderFinish().split('');
        Data.instance.randomOrh();
        this.buffalosOderFinish = Data.instance.getOderFinish();
        this.prepare();
    }

    getFastestBuffalo() {
        var fastestBuffalo = this.buffalos[0];
        this.buffalos.forEach(buffalo => {
            if (buffalo.x > fastestBuffalo.x) {
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
            const distance = -(this.distanceScroll) * this.layerSpeed[index]

            cc.tween(layer)
                .by(durationPrepare, { x: distance })
                .call(() => {
                    Data.instance.layerDistance[index] -= distance;
                })
                .start();
        });
    }

    countDownStart() {
        const time = 3;

        this.countDownLabel.node.active = true;

        this.labelString = {
            value: time
        }
        cc.tween(this.labelString)
            .to(time, { value: 0 })
            .call(() => {
                gaEventEmitter.instance.emit('racing', this.buffalosOderFinish);
                this.isRacing = true;
                this.countDownLabel.node.active = false;
            })
            .start();

    }

    prepareNextRound() {
        cc.tween(this.node)
            .by(1, { x: -this.distanceScrollPrepare })
            .call(() => {
                this.node.x = -200;
                gaEventEmitter.instance.emit('prepareDone')
            })
            .start();

        this.layers.forEach((layer, index) => {
            const distance = -200 * this.layerSpeed[index]
            cc.tween(layer)
                .by(1, { x: distance })
                .call(() => {
                    Data.instance.layerDistance[index] -= distance;
                })
                .start();
        });
    }

}
