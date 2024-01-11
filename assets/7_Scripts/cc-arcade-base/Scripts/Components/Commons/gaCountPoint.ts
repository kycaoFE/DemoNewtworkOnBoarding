import gaPromise from "../../Utilities/gaPromise";
import gaUtils from "../../Utilities/gaUtils";

export default class gaCountPoint {

    //#region ------------------------------------------------------------------ Declare variables
    private _lbl: cc.Label = null;
    private _desValue: number = 0;
    private _duration: number = 0;
    private _tween: cc.Tween = null;
    private _savedHdl: any = null;
    private _lastValue = -1;
    private _id: string = ''; // support for map tween in ActionManager
    private _currentValue: number = 0;
    //#endregion

    //#region  ------------------------------------------------------------- Constructor functions

    constructor (label: cc.Label) {
        this._lbl = label;
        this._id = 'gaCountPoint.' + label.node.name + '.' + label.uuid;
    }

    //#endregion

    //#region  ------------------------------------------------------------------ public functions

    public count(desValue: number, duration: number): gaPromise<number> {
        if (!this._lbl || !this._lbl.isValid) return null;
        this._desValue = desValue;
        this._duration = duration;
        return new gaPromise<number>((resolve) => {
            this._savedHdl = () => this._countCompleted(resolve);
            this._tweenValue();
        })
    }

    public setValue(value: number) {
        this._currentValue = value;
        this._setString(value);
    }

    public fastToResult(): void {
        this._duration = 0.8;
        this._tweenValue();
    }

    public pause() {
        gaUtils.stopTween(this._tween);
    }

    public resume() {
        this._tweenValue();
    }

    public reset() {
        gaUtils.stopTween(this._tween);
        this._tween = null;
        this._desValue = 0;
        this._duration = 0;
        this._lastValue = -1;
        this._currentValue = 0;
    }

    //#endregion

    //#region  ----------------------------------------------------------------- private functions

    private _tweenValue() {
        gaUtils.stopTween(this._tween);
        this._currentValue = parseInt(this._lbl.string.replace(/[,.]/g, "")) || 0;
        const start = Number(this._currentValue);
        const end = Number(this._desValue);
        const diff = end - start;
        const duration = this._duration;
        if (duration > 0) {
            const tweenOpts: any = {
                progress: (_start: number, _end: number, current: any, ratio: number) => {
                    const value = start + diff * ratio;
                    this._duration = duration * (1 - ratio);
                    this._countUpdate(value);
                    return current;
                },
            }
            this._tween = cc.tween(this as any)
                .to(duration, { _currentValue: end }, tweenOpts)
                .call(this._savedHdl)
                .start();
        } else {
            this._savedHdl && this._savedHdl();
        }
    }

    private _countUpdate(value: number) {
        const v = Math.floor(value);
        if (this._lastValue != v) {
            this._lastValue = v;
            this.setValue(v);
        }
    }

    private _countCompleted(resolve: Function) {
        this.setValue(this._desValue);
        this._duration = 0;
        this._savedHdl = null;
        resolve(this._desValue);
    }

    private _setString(value: number) {
        if (this._lbl && this._lbl.isValid) {
            this._lbl.string = gaUtils.formatMoney(value);
        } else {
            gaUtils.stopTween(this._tween);
        }
    }

    //#endregion
}
