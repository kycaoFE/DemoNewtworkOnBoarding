import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node) target: cc.Node = null;
    @property(cc.Node) buffalos: cc.Node[] = [];

    private isFollow: boolean = false;
    onLoad () {
        gaEventEmitter.instance.registerEvent('racing', (buffaloNumber: number)=>{this.target = this.buffalos[buffaloNumber-1]});
    }

    start () {

    }

    update (dt) {
        if(!this.target) return;
        if(this.target.x > 0) this.isFollow = true;
        else this.isFollow = false;
        if(this.isFollow) {
            let targetPosition = new cc.Vec2(this.target.x, 0 )
            this.node.setPosition(targetPosition);
        }
    }

}
