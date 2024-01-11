import gaUserInfo from "./gaUserInfo";

export class gaDemoPlayer extends gaUserInfo {

    private _currentAmt : number = 10000;

    get totalAmount(): number {
        return this._currentAmt;
    }

    bet(amount: number) {
        this._currentAmt -= amount;
    }

    constructor () {
        super();
        this._currentAmt = 10000;
    }

}
