import gaCurrencyCalculator from "../../Common/gaCurrencyCalculator";
import logger from "../../Utilities/gaLogger";
import gaComponent from "../gaComponent";

const { ccclass, property } = cc._decorator;
const DEBUG_WALLET = false;
const INCREASING_TIME = 0.3;

@ccclass
export default class gaWallet extends gaComponent {

    //#region ------------------------------------------------------------------ Declare variables

    @property(cc.Label) private displayLabel: cc.Label = null;

    public isMe: boolean = false;

    private _displayAmount: number = 0;
    private _rewardAmount: number = 0;
    private _targetAmount: number = 0;
    private _totalAmount: number = 0;
    private _incSpeed: number;

    //#endregion

    //#region  --------------------------------------------------------------- Component functions

    update(dt: number): void {
        if (this._displayAmount == this._targetAmount) return;
        this._displayAmount += this._incSpeed * dt;
        if (this._displayAmount > this._targetAmount) {
            this._displayAmount = this._targetAmount;
        }
        this.updateDisplay();
    }


    //#endregion

    //#region  ------------------------------------------------------------------ public functions

    forceUpdateWallet(amount: number) {
        this._displayAmount = amount;
        this._targetAmount = amount;
        this._rewardAmount = 0;
        this._incSpeed = 0;
        this._totalAmount = amount;
        this.updateDisplay();
    }

    updateWallet(amount: number) {
        this._targetAmount = gaCurrencyCalculator.instance.minusTwoNumber(amount, this._rewardAmount);
        if (this._displayAmount > this._targetAmount) {
            this._displayAmount = this._targetAmount;
        } else {
            this._incSpeed = (this._targetAmount - this._displayAmount) / INCREASING_TIME;
        }
        this._totalAmount = amount;
        this.updateDisplay();
    }

    addToDisplay(amount: any) {
        const remainAmount = gaCurrencyCalculator.instance.minusTwoNumber(this._rewardAmount, amount);
        if(remainAmount < 0) {
            logger.warn("Reward Wallet Amount is negative!", remainAmount);
        }
        this._rewardAmount = remainAmount;
        this._targetAmount = gaCurrencyCalculator.instance.plusTwoNumber(this._targetAmount, amount);
        if(this._targetAmount > this._totalAmount) {
            this._targetAmount = this._totalAmount;
        }
        this._incSpeed = (this._targetAmount - this._displayAmount) / INCREASING_TIME;
        DEBUG_WALLET && logger.warn('- addToDisplay   -' + gaCurrencyCalculator.instance.formatCurrency(amount) + " \t= " + gaCurrencyCalculator.instance.formatCurrency(this._rewardAmount));
    }

    addGoldReward(reward: any) {
        this._rewardAmount = gaCurrencyCalculator.instance.plusTwoNumber(this._rewardAmount, reward);
        DEBUG_WALLET && logger.warn('+ addGoldReward  +' + gaCurrencyCalculator.instance.formatCurrency(reward) + " \t= " + gaCurrencyCalculator.instance.formatCurrency(this._rewardAmount));
    }

    updateDisplay() {
        this.displayLabel.string = gaCurrencyCalculator.instance.formatCurrency(this._displayAmount);
    }

    getDisplayWallet(){
        return this._targetAmount;
    }

    getRealWallet(){
        return this._totalAmount;
    }

    resetOnExit() {
        this.displayLabel.string = '';
    }
    //#endregion
}
