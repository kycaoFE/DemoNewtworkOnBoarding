import gaComponent from "../Components/gaComponent";
import gaEventsCode from "../Definitions/gaEventsCode";
import gaDataStore from "../Common/gaDataStore";
import gaBetItem from "./gaBetItem";
import gaBetBoardSetup from "./gaBetBoardSetup";
import gaReferenceManager from "../Common/gaReferenceManager";
import gaUtils from "../Utilities/gaUtils";
import gaBaseConfig from "../Config/gaBaseConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaBetPanel extends gaComponent {
    //#region ------------------------------------------------------------------ Declare variables

    @property(gaBetBoardSetup) betBoard: gaBetBoardSetup = null;

    protected _betItems: Record<string, gaBetItem> = {};
    protected _isLocked: boolean = false;
    protected _isInitialized: boolean = false;

    //#endregion

    //#region  --------------------------------------------------------------- Component functions

    protected onLoad(): void {
        gaReferenceManager.instance.setReference("betPanel", this.node);

        this.register(gaEventsCode.DEMO.START, this._onDemo);
        this.register(gaEventsCode.DEMO.RESET_USER_BET, this._clearDemoBet);

        this.register(gaEventsCode.LOCK_BUTTON, this._onLockButton);
        this.register(gaEventsCode.UNLOCK_BUTTON, this._onUnlockButton);

        this.register(gaEventsCode.DATA.PAYOUT_RECEIVED, this._onPayoutReceived);
    }

    protected onDestroy(): void {
        super.onDestroy();
        this.lock();
    }

    //#endregion

    //#region  ------------------------------------------------------------------ public functions

    public initialize(): void {
        if (this._isInitialized) return;
        this._isInitialized = true;

        this._betItems = this.betBoard.getBetItems();
        for (const id in this._betItems) {
            if (Object.prototype.hasOwnProperty.call(this._betItems, id)) {
                const item = this._betItems[id];
                this._betItems[id] = item;
                item.onDoBet = this.doBet.bind(this);
                item.initialize(id);
            }
        }

        this.lock();
    }

    public startBetting() {
        if (gaBaseConfig.instance.BETTING.AutoRebet) {
            this.rebet();
        } else {
            this.reset();
        }
    }

    public unlock() {
        this._isLocked = false;
        this.setOdds();
        this.refreshGUI();

        for (const id in this._betItems) {
            const betItem = this._betItems[id];
            betItem.unlock();
        }
    }

    public lock() {
        this._isLocked = true;
        this._lockBetButtons(true);
        this.refreshGUI();
    }

    public isLocked(): boolean {
        return this._isLocked;
    }

    public rebet(): void {
        if (gaDataStore.instance.userInfo.availableAmount <= 0) {
            this.reset();
            const callback = () => {
                this._lockBetButtons(false);
            }
            this.emit(gaEventsCode.BET.NOT_ENOUGH_MONEY, callback);
            return;
        }
        const betting = gaUtils.cloneDeep(gaDataStore.instance.betting);
        gaDataStore.instance.userInfo.clearPending();
        gaDataStore.instance.betting = {};
        for (const id in this._betItems) {
            const betItem = this._betItems[id];
            let bettingAmount = betting[id];
            if (bettingAmount > 0) {
                if (this.canBet(id, bettingAmount, false) == false) {
                    bettingAmount = this.getAvailableAmount(id, bettingAmount);
                }
            }
            if (bettingAmount > 0) {
                this.doBet(id, bettingAmount);
            } else {
                betItem.reset();
            }
        }
    }

    public doBet(betId: string, betAmt: number): boolean {
        if (!this.canBet(betId, betAmt)) return false;

        gaDataStore.instance.betting[betId] = betAmt;
        gaDataStore.instance.isUserPlaceAnyBet = true;

        for (const id in this._betItems) {
            const betItem = this._betItems[id];
            if (id == betId) {
                betItem.setBetAmount(betAmt);
            }
        }

        gaDataStore.instance.userInfo.setPending(gaDataStore.instance.totalBet);
        this.emit(gaEventsCode.BET.PLACE_BET);
        this.emit(gaEventsCode.USER.UPDATE_BALANCE, gaDataStore.instance.userInfo.availableAmount);
        this.refreshGUI();

        return true;
    }

    public getAvailableAmount(betId: string, currentBet: number): number {
        const betValue = gaDataStore.instance.betValue;
        const userAvailableAmount = Math.floor(gaDataStore.instance.userInfo.availableAmount / betValue) * betValue;
        const maxBet = gaDataStore.instance.getMaxBet(betId);
        return Math.min(userAvailableAmount, maxBet, currentBet);
    }

    public canBet(betId: string, betAmt: number, notifyDialog: boolean = true): boolean {
        const wallet = gaDataStore.instance.userInfo.availableAmount;
        const currentBet = gaDataStore.instance.betting[betId] || 0;
        const minBetValue = betAmt - currentBet;
        if (wallet < minBetValue) {
            const callback = () => {
                this._lockBetButtons(false);
            }
            if (notifyDialog) {
                this.emit(gaEventsCode.BET.NOT_ENOUGH_MONEY, callback);
            }
            this._lockBetButtons(true);
            return false;
        }

        const maxBet = gaDataStore.instance.getMaxBet(betId);
        if (maxBet && betAmt > maxBet) {
            this._betItems[betId].reachMaxBet(maxBet);
            if (notifyDialog) {
                this.emit(gaEventsCode.BET.REACH_MAX_BET, { betId, maxBet });
            }
            return false;
        }

        return true;
    }



    public reset(): void {
        const isResetBet = gaDataStore.instance.totalBet > 0;
        gaDataStore.instance.userInfo.clearPending();
        gaDataStore.instance.betting = {};
        for (const id in this._betItems) {
            if (Object.prototype.hasOwnProperty.call(this._betItems, id)) {
                const betItem = this._betItems[id];
                betItem.reset();
            }
        }
        if (isResetBet) {
            this.emit(gaEventsCode.BET.CLEAR_BET);
        }
    }

    public getBetItems(id: string): gaBetItem {
        return this._betItems[id];
    }

    //#endregion

    //#region  ----------------------------------------------------------------- private functions

    private _onDemo() {
    }

    private _onLockButton() {
        this._lockBetButtons(true);
    }

    private _onUnlockButton() {
        this._lockBetButtons(false);
    }

    private _lockBetButtons(isLock: boolean) {
        for (const id in this._betItems) {
            const betItem = this._betItems[id];
            if (isLock) {
                betItem.lock();
            } else {
                betItem.unlock();
            }
        }
    }

    private _onPayoutReceived() {
        this.setOdds();
    }

    private _clearDemoBet() {
        this.reset();
        this.setOdds();
        this.refreshGUI();
    }

    protected setOdds(): void {
        for (const id in this._betItems) {
            const betItem = this._betItems[id];
            betItem.setOdds(gaDataStore.instance.getOdds(id));
        }
    }

    protected refreshGUI() { }

    //#endregion
}
