import gaUtils from "../../Utilities/gaUtils";
import gaHistoryItem from "../Popup/PopupItems/gaHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaArcadeBaseTableHistory extends cc.Component {
    @property(cc.Prefab)
    cell: cc.Prefab = null;

    @property(cc.Node)
    private scrollContent: cc.Node = null;

    @property(cc.Boolean)
    optimizeLabel: boolean = true;

    @property({type: cc.Node, visible: function () { return this.optimizeLabel; }})
    protected labelContainer: cc.Node = null;

    initCells(itemPerPage) {
        this.cleanTable();

        for (let i = 0; i < itemPerPage; ++i) {
            const cell = cc.instantiate(this.cell);
            cell.parent = this.node;
            cell.active = true;
        }

        const layout = this.node.getComponent(cc.Layout);
        layout.updateLayout();

        if (this.scrollContent) {
            this.scrollContent.setContentSize(this.node.getContentSize());
        }

        if (!this.labelContainer) {
            this.labelContainer = new cc.Node();
            this.labelContainer.name = "LabelContainer";
            this.labelContainer.parent = this.node.parent;
            this.labelContainer.setSiblingIndex(this.node.getSiblingIndex() + 1);
        }

        this.labelContainer.setContentSize(this.node.getContentSize());
        this.labelContainer.setPosition(this.node.getPosition());

        for (let i = 0; i < this.node.children.length; ++i) {
            const cell = this.node.children[i];
            cell['__childrenLabel'] = cell.getComponentsInChildren(cc.Label).map(l => l.node);
        }
    }

    updateData(data) {
        this.node.children.forEach((child, index) => {
            if (index < data.length) {
                child.getComponent(gaHistoryItem).onSpawn(data[index], index);
                this.setActiveChild(child, true);
            }
            else {
                this.setActiveChild(child, false);
            }
        });
    }

    clearData() {
        this.node.children.forEach(child => this.setActiveChild(child, false));
    }

    cleanTable() {
        gaUtils.destroyAllChildren(this.node);
        gaUtils.destroyAllChildren(this.labelContainer);
    }

    setActiveChild(child: cc.Node, active: boolean) {
        child.active = active;
        const childrenLabel: cc.Node[] = child['__childrenLabel'];
        if (childrenLabel && this.labelContainer) {
            childrenLabel.forEach(labelNode => {
                labelNode.active = active;
                if (active && labelNode.parent != this.labelContainer) {
                    gaUtils.changeParent(labelNode, this.labelContainer);
                }
            });
        }
    }
}
