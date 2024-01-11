import gaCountPoint from "../Commons/gaCountPoint";
import gaComponent from "../gaComponent";
import gaEventsCode from "../../Definitions/gaEventsCode";
import logger from "../../Utilities/gaLogger";
import gaReferenceManager from "../../Common/gaReferenceManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaJackpotFrame extends gaComponent {

    @property(cc.Label) lblValue: cc.Label = null;
    @property jackpotKey: string = "";

    isInitialized: boolean = false;
    jpBetValue: number = 0;
    counter: gaCountPoint = null;
    isPausedJP: boolean = false;
    jpMultiplier: number = 1;
    jackpotData: number = 0;

    protected onLoad(): void {
        gaReferenceManager.instance.setReference('jackpotPanel', this.node);
        if (!this.lblValue) this.lblValue = this.node.getComponentInChildren(cc.Label);
        if (!this.lblValue) {
            logger.warn("Jackpot label is empty");
            return;
        }
        this.counter = new gaCountPoint(this.lblValue);
        this.counter.setValue(0);
        super.onLoad();
    }

    protected initEvents(): void {
        this.register(gaEventsCode.JACKPOT.INIT_JACKPOT, this.initJackpot);
        this.register(gaEventsCode.JACKPOT.UPDATE_JACKPOT, this.jackpotUpdate);
        this.register(gaEventsCode.JACKPOT.PAUSE_JACKPOT, this.pauseRenderJP);
        this.register(gaEventsCode.JACKPOT.RESUME_JACKPOT, this.resumeRenderJP);
        this.register(gaEventsCode.JACKPOT.RESET_JACKPOT, this.resetCurrentJP);
    }

    initJackpot(data) {
        if (this.jackpotKey == "") {
            logger.warn("Jackpot key is empty");
            return;
        }
        if (!this.isInitialized) {
            this.isInitialized = true;
            if (data[this.jackpotKey] != null) {
                this.jackpotData = data[this.jackpotKey];
            }
            this.renderJackpot(3);
        }
        else {
            this.renderJackpot(0.1);
        }
    }

    jackpotUpdate(data) {
        if (data[this.jackpotKey] != null) {
            this.jackpotData = data[this.jackpotKey];
        }
        this.renderJackpot(3);
    }

    parseJackpotValue(data): number {
        return 0;
    }

    pauseRenderJP() {
        if (this.isPausedJP) return;
        this.isPausedJP = true;
        this.counter.pause();
    }

    resumeRenderJP() {
        if (!this.isPausedJP) return;
        this.isPausedJP = false;
        this.counter.resume();
        this.renderJackpot(1);
    }

    renderJackpot(time: number = 3) {
        if (this.isPausedJP || !this.isInitialized) return;
        this.counter.count(this.jackpotData, time);
    }

    getJackpotValue(jpType: string) {
        if (this.jackpotData[jpType]) {
            return this.jackpotData[jpType];
        } else {
            logger.warn("invalid Jackpot Id", jpType, this.jackpotData);
            return null;
        }
    }

    resetCurrentJP() {
        const defaultValue: number = this.jpBetValue * this.jpMultiplier;
        this.counter.count(defaultValue, 0);
    }

    onClickJP() {
        this.soundPlayer.playSFXClick();
        this.emit(gaEventsCode.POPUP.SHOW_POPUP_HISTORY_JP);
    }
}
