import gaSoundPlayer from "../Sound/gaSoundPlayer";
import gaUtils from "../Utilities/gaUtils";
import gaEventEmitter from "../Common/gaEventEmitter";
import gaReferenceManager from "../Common/gaReferenceManager";

const { ccclass } = cc._decorator;

@ccclass
export default abstract class gaComponent extends cc.Component {
    public get emitter(): gaEventEmitter {
        return gaEventEmitter.instance
    }

    private _soundPlayer: gaSoundPlayer = null;
    public get soundPlayer(): gaSoundPlayer {
        if (this._soundPlayer == null) {
            this._soundPlayer = gaReferenceManager.instance.soundPlayer.getComponent("gaSoundPlayer");
        }
        return this._soundPlayer;
    }

    register(eventCode: string, listener: Function) {
        this.emitter && this.emitter.registerEvent(eventCode, listener, this);
    }

    registerOnce(eventCode: string, listener: Function) {
        this.emitter && this.emitter.registerOnce(eventCode, listener, this);
    }

    emit(eventCode: string, ...args: any) {
        this.emitter && this.emitter.emit(eventCode, ...args);
    }

    removeEvent(eventCode: string) {
        this.emitter && this.emitter.removeEvent(eventCode);
    }

    removeEvents() {
        this.emitter && this.emitter.removeEvents(this);
    }

    protected onLoad(): void {
        this.initEvents();
    }

    protected initEvents(): void {

    }

    protected onDestroy(): void {
        gaUtils.stopAllByTarget(this);
        this.removeEvents();
    }
}
