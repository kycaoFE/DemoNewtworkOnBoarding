const { ccclass, property } = cc._decorator;

import { Data, ccData } from "./data";
import BetStateManager from "./betStateManager";
import Network from "./network";
import SendMessage from "./sendMessage";


@ccclass
export default class MainController extends cc.Component {
  protected sendMessage: any;
  protected betStateManager: any;
  protected network: any;
  protected uiManager: any;
  protected data: any;
  protected oddsData: any;

  @property(cc.Prefab) oddsItemPrefab: cc.Prefab = null;
  @property(cc.Node) betBackgroundPools: cc.Node[] = [];
  @property(cc.Node) betPools: cc.Node[] = [];

  @property(cc.Node) ui: cc.Node = null;

  onLoad() {
    Data.instance = new Data();
    ccData.instance  = new ccData();
  }

  start() {
    this.uiManager = this.ui.getComponent("uiManager");
    this.betStateManager = new BetStateManager();
    this.sendMessage = new SendMessage();
    this.network = new Network();
  }

  login(): void {
    this.network.login(() => {
      this.uiManager.loginFailed();
    });
  }

  joinGame(): void {
    this.sendMessage.joinGame((response: any) => {
      this.uiManager.setLabelPopup("Join Game Success");
      this.data = response;
      Data.instance.setGameNumber(response.data.exD.ed.split(":")[1]);
    });
  }

  getODDs(): void {
    this.oddsData = this.betStateManager.getODDs(this.data);
    this.uiManager.setLabelPopup(this.oddsData);
  }

  instantiateBetState(): void {
    this.uiManager.closePopup();
    this.uiManager.activeButtonInit(false);
    this.oddsData = (this.oddsData) ? this.oddsData : this.betStateManager.getODDs(this.data);
    this.betStateManager.instantiateBet(this.oddsData, this.oddsItemPrefab, this.betPools, this.betBackgroundPools);
  }

  bet(): void {
    const payload: any = this.betStateManager.bet(this.betPools);
    this.sendMessage._executeCommand(payload, (response: any) => {
      Data.instance.dataRoundCurrent = response.event == "n" ? response : null;
      if (Data.instance.dataRoundCurrent) { 
        this.uiManager.openPopup();
        this.uiManager.setLabelPopup(this.betStateManager.showResult());
      }
    });
  }
}
