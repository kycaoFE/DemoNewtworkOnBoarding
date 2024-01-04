const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class gaNotifyComponent extends cc.Component {

    @property(cc.Node)
    protected contentNode: cc.Node = null;
    protected _isShow: boolean = false;
    protected _lstMsgs: any[] = [];

    protected onLoad(): void {
        if (!this.contentNode) {
            this.contentNode = this.node;
        }
        this.node.active = false;
        this.initItems();
    }

    public onEventHide(): void {
        this.node.stopAllActions();
        this.contentNode && this.contentNode.removeAllChildren(true);
    }

    public onAfterFinishedRacing(): void {
        
    }

    public onViewInGame(): void {
        
    }

    onStackMessage() {
        if (this._lstMsgs.length > 0) {
            const data = this._lstMsgs.shift();
            this.play(data);
        }
        else {
            this.hide();
        }
    }

    abstract initItems(): void;
    abstract show(data: any): void;
    abstract hide(): void;
    abstract play(data: any): void;
    abstract reset(): void;
}
