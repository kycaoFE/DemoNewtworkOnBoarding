import gaDataStore from "../Common/gaDataStore";
import logger from "../Utilities/gaLogger";
import gaUtils from "../Utilities/gaUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaBetItem extends cc.Component {

    //#region ------------------------------------------------------------------ Declare variables

    @property(cc.Button) btnBet: cc.Button = null;
    @property(cc.Label) lblOdds: cc.Label = null;
    @property(cc.Label) lblAmount: cc.Label = null;
    @property(cc.Node) nodeBetMax: cc.Node = null;
    @property(cc.Node) betVFX: cc.Node = null;

    public onDoBet: (betId: string, amount: number) => boolean = null;

    private _betId: string = '';
    public get betId(): string {
        return this._betId;
    }

    protected _betAmount: number = 0;
    protected _odds: number = 0;
    protected _isLock: boolean = false;
    protected _isInitialized: boolean = false;

    //#endregion

    //#region  --------------------------------------------------------------- Component functions
    protected onLoad(): void {
        this.reset();
        this.turnOffEffect(true);
    }

    //#endregion

    //#region  ------------------------------------------------------------------ public functions

    public initialize(id: string): void {
        if (this._isInitialized) return;
        this._isInitialized = true;
        this._betId = id;
    }

    public turnOnEffect() {
        if (cc.isValid(this.betVFX)) {
            this.betVFX.active = true;
        }
    }

    public turnOffEffect(force = false) {
        if (force || gaDataStore.instance.isUserPlaceAnyBet) {
            if (cc.isValid(this.betVFX)) {
                this.betVFX.active = false;
            }
        }
    }

    public lock(): void {
        if (this._isLock) return;
        this._isLock = true;
        if (cc.isValid(this.btnBet)) {
            this.btnBet.interactable = false;
            this.btnBet.node.targetOff(this);
        }
    }

    public unlock(): void {
        this._isLock = false;
        if (cc.isValid(this.btnBet)) {
            this.btnBet.interactable = true;
            this.btnBet.node.targetOff(this);
            this.btnBet.node.on('click', this.onBetClick, this);
        }
    }

    public setOdds(odds: number) {
        if (odds != null) {
            this._odds = odds;
            this.lblOdds.string = odds > 0 ? `x${odds}` : '';
        }
    }

    public getOdds(): number {
        return this._odds;
    }

    public showResult() {
        let isActive = true;
        this.lblAmount.node.active = this.lblOdds.node.active = isActive;
        cc.tween(this).repeatForever(
            cc.tween()
                .delay(0.3)
                .call(() => {
                    isActive = !isActive;
                    this.lblAmount.node.active = this.lblOdds.node.active = isActive;
                })
        ).start();
    }

    public setBetAmount(amount: number) {
        this._betAmount = Math.max(0, amount);
        this.lblAmount.string = amount > 0 ? gaUtils.formatMoney(amount) : "";
    }

    public reachMaxBet(maxBet: number) {
        logger.warn("ReachMaxBet: betId =", this.betId, "maxBet =", gaUtils.formatWallet(maxBet));
        if (!cc.isValid(this.nodeBetMax)) return;
        this.nodeBetMax.active = true;
        cc.tween(this.nodeBetMax)
            .delay(0.5)
            .call(() => {
                this.nodeBetMax.active = false;
            })
            .start();
    }

    public reset() {
        gaUtils.stopAllByTarget(this.node);
        this.setBetAmount(0);
        this.setOdds(this._odds);
        this.lblAmount.string = '';
        this.lblAmount.node.active = true;
        this.lblOdds.node.active = true;
        this.node.active = true;
        if (cc.isValid(this.nodeBetMax)) {
            this.nodeBetMax.active = false;
        }
        this.turnOffEffect();
    }

    //#endregion

    //#region  ----------------------------------------------------------------- private functions

    protected onBetClick(): void {
        if (!this._isLock) {
            this.doBet();
        }
    }

    protected doBet(): boolean {
        if (!this._isLock && this.onDoBet) {
            const isValid = this.onDoBet(this._betId, this._betAmount + gaDataStore.instance.betValue);
            return isValid;
        }
        return false;
    }

    //#endregion
}
