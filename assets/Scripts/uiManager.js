import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
import gaEventCode from "./cc-arcade-base/Scripts/Definitions/gaEventsCode";
cc.Class({
    extends: cc.Component,

    properties: {
        popupLbl: cc.Label,

        popupNode: cc.Node,

        scrollNode: cc.Node,

        payout: cc.Node,
        payoutBackground: cc.Node,

        startButton: cc.Node,
        button: [cc.Node],
    },

    start() {
        this.popupNode.active = false;
        this.popupNode.scale = 0;
        this.activePayout(false);
        this.activeButtonCreator(true);
        gaEventEmitter.instance.registerEvent(gaEventCode.NETWORK.WEB_SOCKET_OPEN, this.loginSuccess.bind(this));
        gaEventEmitter.instance.registerEvent(gaEventCode.NETWORK.CANNOT_AUTHEN, this.loginFailed.bind(this));
    },

    openPopup() {
        this.popupNode.active = true;
        this.scrollNode.active = false;
        this.activePayout(false);
        cc.tween(this.popupNode)
            .to(0.5, { scale: 1 })
            .start();
    },

    closePopup() {
        cc.tween(this.popupNode)
            .to(0.5, { scale: 0 })
            .call(() => {
                this.popupNode.active = false;
                this.scrollNode.active = true;
                this.activePayout(true);
            })
            .start();
    },

    loginFailed() {
        this.loginStatus(false);
    },

    loginSuccess() {
        this.loginStatus(true);
    },

    loginStatus(status) {
        this.openPopup();
        this.popupLbl.string = (status) ? 'Login Success' : 'Login Failed';
    },

    setLabel(stringLbl) {
        this.popupLbl.string = stringLbl;
    },

    activePayout(status) {
        this.payout.active = status;
        this.payoutBackground.active = status;
        this.startButton.active = status;
    },

    activeButtonCreator(status) {
        this.button.forEach(element => {
            element.active = status;
        });
    }

});
