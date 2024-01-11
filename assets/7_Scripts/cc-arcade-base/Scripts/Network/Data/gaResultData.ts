export default class gaResultData {

    private _totalWinAmount: number = 0;
    public get totalWinAmount(): number {
        return this._totalWinAmount;
    }

    private _bettingWinAmount: number = 0;
    public get bettingWinAmount(): number {
        return this._bettingWinAmount;
    }

    sessionId: string = "";
    commandId: string = "";

    constructor (data: any) {
        const { wg } = data;
        const wgValues = wg.split(',');
        wgValues.forEach((value: string) => this._bettingWinAmount += parseFloat(value.split(';')[1]));
        this._totalWinAmount = this.bettingWinAmount;

        this.sessionId = data.id;
        this.commandId = data.cId;
    }
}
