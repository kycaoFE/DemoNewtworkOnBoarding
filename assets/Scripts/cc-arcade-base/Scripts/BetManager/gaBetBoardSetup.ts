import gaComponent from "../Components/gaComponent";
import gaBetItem from "./gaBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class gaBetBoardSetup extends gaComponent {

    betItems: Record<string, gaBetItem> = {};
    private _isInitialized: boolean = false;

    protected onLoad(): void {
        super.onLoad();
        if ((!this._isInitialized)) {
            this._isInitialized = true;
            this.initBoard();
        }
    }

    getBetItems(): Record<string, gaBetItem> {
        if ((!this._isInitialized)) {
            this._isInitialized = true;
            this.initBoard();
        }
        return this.betItems;
    }

    protected abstract initBoard();
}
