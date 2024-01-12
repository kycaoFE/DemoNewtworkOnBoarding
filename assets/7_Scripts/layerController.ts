const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab) layer: cc.Prefab = null;

    @property _positionSpawn: number = -1200;

    private count: number = 0;
    private numberChildren = 7;


    start() {

    }

    update(dt) {
        if (this.node.x <= this._positionSpawn * this.count) {
            this.spawnLayer();
        }
    }

    spawnLayer() {
        const layer = cc.instantiate(this.layer);
        layer.parent = this.node;
        const positionInstantiate = (this.numberChildren + this.count) * layer.width;
        layer.x = positionInstantiate;
        this.count++;
        this.node.children[0].destroy();
    }
}
