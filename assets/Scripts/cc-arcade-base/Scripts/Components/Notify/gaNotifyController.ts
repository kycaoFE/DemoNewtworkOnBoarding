import gaBaseConfig from "../../Config/gaBaseConfig";
import gaNotifyJackpot from "./gaNotifyJackpot";
import gaComponent from '../gaComponent'
import gaDataStore from "../../Common/gaDataStore";
import gaEventsCode from "../../Definitions/gaEventsCode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaNotifyController extends gaComponent {

    @property(gaNotifyJackpot)
    protected notifyJackpot: gaNotifyJackpot = null;

    protected initEvents(): void {
        this.register(gaEventsCode.NOTIFY.SHOW_NOTIFY, this.onNotify);
        this.register(gaEventsCode.NOTIFY.IN_RACING, this.onViewInGame);
        this.register(gaEventsCode.NOTIFY.AFTER_FINISHED_RACING, this.onAfterFinishedRacing);
        this.register(gaEventsCode.COMMON.GAME_HIDE, this.onEventHide);
    }

    protected onViewInGame(): void {
        if (gaDataStore.instance.isTutorial) return;
        this.notifyJackpot && this.notifyJackpot.onViewInGame();
    }

    protected onEventHide(): void {
        this.notifyJackpot && this.notifyJackpot.onEventHide();
    }

    protected onAfterFinishedRacing(): void {
        if (gaDataStore.instance.isTutorial) return;
        this.notifyJackpot && this.notifyJackpot.onAfterFinishedRacing();
    }

    protected onNotify(data: any) {
        if (gaDataStore.instance.isTutorial) return;
        if (gaDataStore.instance.result && gaDataStore.instance.result.commandId == data.cmdId) return;

        if (this.isValidData(data)) {
            this.notifyJackpot && this.notifyJackpot.show(data);
        }
    }

    protected isValidData(data: any): boolean {
        const notifyType = gaBaseConfig.instance.NOTIFY_TYPE;
        let isValid = false;
        for (const type in notifyType) {
            if (Object.prototype.hasOwnProperty.call(notifyType, type) && data[notifyType[type]]) {
                isValid = true;
            }
        }
        return isValid;
    }
}
