const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab) layer: cc.Prefab = null;

    @property _positionSpawn: number = -800;

    private count: number = 1;
    private numberChildren = 7;

    update(dt: number) {
        if (this.node.x <= this._positionSpawn * this.count) {
            this.spawnLayer();
            cc.warn('spawn');
        }
    }

    spawnLayer() {
        const layer = cc.instantiate(this.layer);
        layer.parent = this.node;
        const positionInstantiate = (this.numberChildren + this.count -1) * layer.width;
        layer.x = positionInstantiate;
        this.count++;
        this.node.children[0].destroy();
    }
}
