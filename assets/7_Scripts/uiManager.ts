import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
import gaEventCode from "./cc-arcade-base/Scripts/Definitions/gaEventsCode";
import { Data } from "./data";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIManager extends cc.Component {
  @property(cc.Node) popupNode: cc.Node = null;
  @property(cc.Node) scrollNode: cc.Node = null;
  @property(cc.Node) betPools: cc.Node = null;
  @property(cc.Node) betBackground: cc.Node = null;
  @property(cc.Button) startButton: cc.Button = null;
  @property(cc.Node) startButtonBackground: cc.Node = null;
  @property(cc.Node) autoBetButton: cc.Node = null;

  @property(cc.Label) popupLbl: cc.Label = null;

  start() {
    this.popupNode.active = false;
    this.popupNode.scale = 0;
    this.activeBettingArea(true);
    gaEventEmitter.instance.registerEvent(gaEventCode.NETWORK.CANNOT_AUTHEN, this.loginFailed.bind(this));
    gaEventEmitter.instance.registerEvent('canBet', this.enableStartButton.bind(this));
    this.enableStartButton(false);
  }

  openPopup(): void {
    this.popupNode.active = true;
    cc.tween(this.popupNode)
      .to(0.5, { scale: 1 })
      .start();
  }

  closePopup(): void {
    cc.tween(this.popupNode)
      .to(0.5, { scale: 0 })
      .call(() => {
        this.popupNode.active = false;
      })
      .start();
  }

  loginFailed(): void {
    this.openPopup();
    this.setLabelPopup("Login Failed");
  }

  loginSuccess(): void {
    this.openPopup();
    this.setLabelPopup("Login Success");
  }

  scrollUI(distance: number){
    cc.tween(this.node)
    .by(Data.instance.timePrepare, { x: distance})
    .start();
  }

  setLabelPopup(content: string): void {
    this.popupLbl.string = content;
  }

  activeBettingArea(status: boolean): void {
    this.betPools.active = status;
    this.betBackground.active = status;
    this.startButton.node.active = status;
    this.scrollNode.active = status;
    // this.autoBetButton.active = status;
  }

  enableStartButton(state){
    if(state){
      this.startButton.interactable = true;
      this.startButtonBackground.color = cc.color(74,155,70);
      return;
    }
    this.startButton.interactable = false;
    this.startButtonBackground.color = cc.color(139,139,139);  

  }
}
