import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
import gaEventCode from "./cc-arcade-base/Scripts/Definitions/gaEventsCode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class uiManager extends cc.Component {
  @property(cc.Node) popupNode: cc.Node = null;
  @property(cc.Node) scrollNode: cc.Node = null;
  @property(cc.Node) betPools: cc.Node = null;
  @property(cc.Node) betBackground: cc.Node = null;
  @property(cc.Node) startButton: cc.Node = null;
  @property(cc.Node) cameraNode: cc.Node = null;

  @property(cc.Label) popupLbl: cc.Label = null;

  start() {
    this.popupNode.active = false;
    this.popupNode.scale = 0;
    this.activeBettingArea(false);
    gaEventEmitter.instance.registerEvent(gaEventCode.NETWORK.CANNOT_AUTHEN, this.loginFailed.bind(this));
  }

  openPopup(): void {
    this.popupNode.x = this.cameraNode.x;
    this.popupNode.active = true;
    this.scrollNode.active = false;
    this.activeBettingArea(false);
    cc.tween(this.popupNode)
      .to(0.5, { scale: 0.5 })
      .start();
  }

  closePopup(): void {
    cc.tween(this.popupNode)
      .to(0.5, { scale: 0 })
      .call(() => {
        this.popupNode.active = false;
        this.scrollNode.active = true;
        this.activeBettingArea(true);
      })
      .start();
  }

  loginFailed(): void {
    this.openPopup();
    this.setLabelPopup("Login Failed");
  }

  setLabelPopup(content: string): void {
    this.popupLbl.string = content;
  }

  activeBettingArea(status: boolean): void {
    this.betPools.active = status;
    this.betBackground.active = status;
    this.startButton.active = status;
    this.scrollNode.active = status;
  }
}
