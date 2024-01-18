import { Data } from "./data";
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab) layer: cc.Prefab = null;
    @property indexLayer: number;

    @property _positionSpawn: number;

    private count: number = 1;
    private numberChildren = 7;

    protected onLoad(): void {

    }

    protected start(): void {
        this._positionSpawn = 960;
        gaEventEmitter.instance.registerEvent('prepareDone', this.spawnLayer.bind(this));
    }
    spawnLayer() {
        cc.warn('spawn');
        const time = Math.ceil(Data.instance.layerDistance[this.indexLayer] / this._positionSpawn);

        for (let i = 0; i < time; i++) {
            let layer = cc.instantiate(this.layer);
            layer.parent = this.node;
            let positionInstantiate = (this.numberChildren + this.count - 1) * layer.width;
            layer.x = positionInstantiate;
            this.count++;
            if (this.numberChildren > 10) {
                this.node.children[i].destroy();
            }
        }
        Data.instance.layerDistance[this.indexLayer] = 0;
    }
}
