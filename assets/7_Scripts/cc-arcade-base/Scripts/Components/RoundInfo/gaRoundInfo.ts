import gaDataStore from "../../Common/gaDataStore";
import gaEventsCode from "../../Definitions/gaEventsCode";
import gaComponent from "../gaComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaRoundInfo extends gaComponent {

    //#region ------------------------------------------------------------------ Declare variables
    @property(cc.Label) gameNumber: cc.Label = null;
    @property(cc.Label) userOnline: cc.Label = null;
    //#endregion

    //#region  --------------------------------------------------------------- Component functions
    protected start(): void {
        this.setGameNumber(null);
        this.setUserOnline(1);
    }
    //#endregion


    //#region  ----------------------------------------------------------------- private functions

    protected initEvents(): void {
        this.register(gaEventsCode.STATE.START_BETTING, this.updateRoundInfo);
        this.register(gaEventsCode.VIEW.SET_GAME_NUMBER, this.setGameNumber);
        this.register(gaEventsCode.VIEW.SET_USER_ONLINE, this.setUserOnline);
    }

    protected updateRoundInfo(): void {
        this.setGameNumber(gaDataStore.instance.gameNumber);
        this.setUserOnline(gaDataStore.instance.userActive);
    }

    protected setGameNumber(gameNum: string): void {
        if (this.gameNumber) {
            this.gameNumber.string = gameNum ? `#${gameNum}` : '';
        }
    }

    protected setUserOnline(userOnline: number): void {
        if (this.userOnline) {
            this.userOnline.string = Math.max(1, userOnline) + '';
        }
    }

    //#endregion
}