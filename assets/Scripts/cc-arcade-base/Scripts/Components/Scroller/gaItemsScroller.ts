import gaBaseConfig from "../../Config/gaBaseConfig";
import gaComponent from "../gaComponent";
import gaScrollItem from "./gaScrollItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaItemsScroller extends gaComponent {

    @property(cc.Button)
    btnMinus: cc.Button = null;

    @property(cc.Button)
    btnPlus: cc.Button = null;

    @property(cc.Node)
    prefabItem: cc.Node = null;

    touchMoveDirection = null;

    touchPos: cc.Vec2 = cc.v2(0, 0);

    items = [];

    scaleMin: number = 0.8;

    currItemIdx: number = 0;

    itemLeftBoundary = null;
    itemRightBoundary = null;
    center: cc.Vec2 = cc.v2(0.0, 0.0);

    autoScrollDistance: number = 0.0;
    autoScrollSpeed: number = 0.0;
    isAutoScrolling: boolean = false;

    scrollDirection = null;

    arrValue = [];

    totalItem: number = 0;

    itemPadding: number = 50;

    scaleMax: number = 1;

    scaleViewDistance: number = 100;

    protected onLoad(): void {
        // Register Touch Event
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegan, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMoved, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this, true);
    }

    onTouchBegan(touch) {
        this.touchPos = touch.getLocation();
    }

    onTouchMoved(touch) {
        this.handleMoveLogic(touch);
    }

    handleMoveLogic(touch) {
        const touchPoint = touch.getLocation();
        const offset = touchPoint.x - touch.getPreviousLocation().x;

        const { TouchDirectionAutoBot } = gaBaseConfig.instance;

        if (offset < 0) {
            this.touchMoveDirection = TouchDirectionAutoBot.LEFT;
        } else if (offset > 0) {
            this.touchMoveDirection = TouchDirectionAutoBot.RIGHT;
        }

        this.moveItem(offset);
    }

    onTouchEnded(touch) {
        let _isAutoScroll = false;
        if (this.touchPos.x - touch.getPreviousLocation().x != 0.0) {
            _isAutoScroll = true;
        }

        if (_isAutoScroll) {
            this.handleReleaseLogic();
        }
    }

    onTouchCancel() {
        this.handleReleaseLogic();
    }

    handleReleaseLogic() {
        let isScrollOverScreen = true;
        let scaleMaxRatio = this.scaleMin;
        this.items.forEach((item) => {
            if (item && item.scale > scaleMaxRatio) {
                scaleMaxRatio = item.scale;
                this.currItemIdx = item.value;
                isScrollOverScreen = false;
            }
        });

        if (isScrollOverScreen) {
            if (this.itemLeftBoundary && this.itemLeftBoundary.x > this.center.x) {
                this.currItemIdx = 0;
            } else if (this.itemRightBoundary && this.itemRightBoundary.x < this.center.x) {
                this.currItemIdx = this.items.length - 1;
            }
        }

        this.scrollToItem(this.currItemIdx);
    }

    initItemList(arrValue) {

        if (arrValue) {
            this.arrValue = arrValue;
            this.totalItem = this.arrValue.length;
        }
        else {
            return;
        }

        let posX = 0.0;
        const paddingItem = this.itemPadding;
        this.prefabItem.parent = null;

        for (let index = 0; index < this.arrValue.length; index++) {
            const item = cc.instantiate(this.prefabItem);
            const itemComponent = item.getComponent(gaScrollItem);
            itemComponent.value = index;
            item.scale = this.scaleMin;
            this.node.addChild(item);

            item.x = posX;

            item.on(cc.Node.EventType.TOUCH_END, () => {
                this.scrollToItem(itemComponent.value);
            });

            posX += item.getBoundingBox().width + paddingItem;

            itemComponent.setLabelStr(index === this.arrValue.length - 1 ? gaBaseConfig.instance.TIMER_SCROLLER.MAX_TIME : this.arrValue[index]);
            this.items.push(item);
        }
        this.prefabItem.destroy();
    }

    updateLeftRightBoundary() {
        if (Array.isArray(this.items) && this.items.length > 0) {
            const { 0: firstItem, [this.items.length - 1]: lastItem } = this.items;
            this.itemLeftBoundary = firstItem;
            this.itemRightBoundary = lastItem;
        }
    }

    reset() {
        this.currItemIdx = Math.floor(this.totalItem * 0.5);
        const curItem = this.getCurrentItem();
        const moveDistance = -curItem.x;
        this.moveItem(moveDistance);
    }

    getCurrentItem() {
        if (this.currItemIdx >= 0) {
            return this.items[this.currItemIdx];
        }
    }

    protected update(dt: number): void {
        this.items.forEach((item) => {
            this.updateItemStatus(item);
        });

        if (this.isAutoScrolling) {
            this._autoScroll(dt);
        }
    }

    updateItemStatus(item) {
        const distance = Math.abs(item.x - this.center.x);
        const scaleRatio = Math.max(this.scaleMin, this.scaleMax - (distance * (this.scaleMax - this.scaleMin)) / this.scaleViewDistance);
        item.scale = scaleRatio;
        item.opacity = distance > (this.node.width + item.width) / 2 ? 0 : 255;
    }

    private _autoScroll(dt) {
        if (this.scrollDirection == gaBaseConfig.instance.ScrollDirectionAutoBot.RIGHT) {
            let step = this.autoScrollSpeed * dt;
            if (this.autoScrollDistance + step >= 0.0) {
                step = -this.autoScrollDistance;
                this.autoScrollDistance = 0.0;
                this.isAutoScrolling = false;
            } else {
                this.autoScrollDistance += step;
            }
            this.moveItem(step);
        }
        else {
            let step = this.autoScrollSpeed * dt;
            if (this.autoScrollDistance - step <= 0.0) {
                step = this.autoScrollDistance;
                this.autoScrollDistance = 0.0;
                this.isAutoScrolling = false;
            } else {
                this.autoScrollDistance -= step;
            }
            this.moveItem(-step);
        }
    }


    moveItem(offset) {
        this.items.forEach((item) => {
            if (item) {
                item.x += offset;
            }
        });
    }

    moveToPreviousItem() {
        if (this.currItemIdx > 1) {
            this.scrollToItem(this.currItemIdx - 1);
        }
    }

    moveToNextItem() {
        if (this.currItemIdx < this.items.length - 1) {
            this.scrollToItem(this.currItemIdx + 1);
        }
    }

    scrollToItem(idx) {
        idx = parseInt(idx);
        if (idx < 1) idx = 1;
        if (idx >= this.items.length) {
            idx = this.items.length - 1;
        }
        this.currItemIdx = idx;
        const curItem = this.items[idx];
        this.autoScrollDistance = curItem.x - this.center.x;
        this.autoScrollSpeed = Math.abs(this.autoScrollDistance) / 0.2;
        const { ScrollDirectionAutoBot } = gaBaseConfig.instance;
        this.scrollDirection = this.autoScrollDistance > 0 ? ScrollDirectionAutoBot.LEFT : ScrollDirectionAutoBot.RIGHT;
        this.isAutoScrolling = true;
        this.btnMinus.interactable = !(this.currItemIdx === 1);
        this.btnPlus.interactable = !(this.currItemIdx === (this.items.length - 1));
    }
}
