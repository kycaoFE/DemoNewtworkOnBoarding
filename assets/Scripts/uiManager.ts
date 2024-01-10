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
  @property(cc.Node) buttons: cc.Node[] = [];
  @property(cc.Node) cameraNode: cc.Node = null;

  @property(cc.Label) popupLbl: cc.Label = null;

  start() {
    this.popupNode.active = false;
    this.popupNode.scale = 0;
    this.activeBettingArea(false);
    this.activeButtonInit(true);
    gaEventEmitter.instance.registerEvent(gaEventCode.NETWORK.CANNOT_AUTHEN, this.loginFailed.bind(this));
  }

  openPopup(): void {
    this.popupNode.active = true;
    this.scrollNode.active = false;
    this.activeBettingArea(false);
    cc.tween(this.popupNode)
      .to(0.5, { scale: 0.5 })
      .start();
    this.node.x = this.cameraNode.x;
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
      this.cameraNode.x = 0;
      this.node.x = this.cameraNode.x;
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
  }
  activeButtonInit(status: boolean): void {
    this.buttons.forEach((element) => {
      element.active = status;
    });
  }
}
