import gaEventsCode from "../../Definitions/gaEventsCode";
import gaDataStore from "../../Common/gaDataStore";
import gaUtils from "../../Utilities/gaUtils";
import gaComponent from "../gaComponent";
import gaWallet from "./gaWallet";
import gaAvatarProvider from "../../Common/gaAvatarProvider";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaUserUI extends gaComponent {

    //#region ------------------------------------------------------------------ Declare variables

    @property(cc.Label) private lblUserName: cc.Label = null;
    @property(cc.Sprite) private spriteAvatar: cc.Sprite = null;
    @property(gaWallet) private lblWallet: gaWallet = null;

    //#endregion

    //#region  ----------------------------------------------------------------- private functions

    protected start(): void {
        this.updateUserData();
    }

    protected initEvents(): void {
        super.initEvents();
        this.register(gaEventsCode.USER.UPDATE_DATA, this.updateUserData);
        this.register(gaEventsCode.USER.UPDATE_BALANCE, this.setWalletAmount);
    }

    protected updateUserData() {
        if (gaDataStore.instance.userInfo) {
            this.setUserName(gaDataStore.instance.userInfo.displayName);
            this.setWalletAmount(gaDataStore.instance.userInfo.availableAmount);
            this.setUserAvatar(gaDataStore.instance.userInfo.avatar);
        } else {
            this.setUserName('');
            this.setWalletAmount(0);
            this.setUserAvatar('');
        }
    }

    protected setUserName(displayName: string) {
        this.lblUserName.string = gaUtils.formatUserName(displayName);
    }

    protected setWalletAmount(amount: number) {
        if (amount == null) {
            amount = gaDataStore.instance.userInfo.availableAmount;
        }
        this.lblWallet.updateWallet(amount);
    }

    protected setUserAvatar(avatar: string) {
        gaAvatarProvider.instance.loadAvatarFrame(this.spriteAvatar, avatar);
    }

    //#endregion
}
