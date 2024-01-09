const { ccclass, property } = cc._decorator;
import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
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
  @property(cc.Node) racingController: cc.Node = null;

  onLoad() {
    Data.instance = new Data();
    ccData.instance = new ccData();
    gaEventEmitter.instance.registerEvent('racingDone', this.racingDone.bind(this));
  }

  start() {
    this.uiManager = this.ui.getComponent("uiManager");
    this.betStateManager = new BetStateManager();
    this.sendMessage = new SendMessage();
    this.network = new Network();
    this.racingController.active = false;
    this.login();
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
      const ed = response.data.exD.ed;
      Data.instance.setGameNumber(ed.substr(ed.indexOf(':') + 1, 7));
      this.instantiateBetState();
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
    // cc.warn(Data.instance.gameNumber);
    // cc.warn('payload', payload);
    this.sendMessage._executeCommand(payload, (response: any) => {
      Data.instance.dataRoundCurrent = response.event == "n" ? response : null;
      if (Data.instance.dataRoundCurrent) {
        this.racing();
      }
    });
  }

  reJoinGame() {
    this.sendMessage.joinGame((response: any) => {
      this.data = response;
      const ed = response.data.exD.ed;
      Data.instance.setGameNumber(ed.substr(ed.indexOf(':') + 1, 7));
    });
  }

  racing() {
    this.ui.active = false;
    this.racingController.active = true;
    this.racingController.getComponent('racingController').racing(() => {

    })
  }

  racingDone() {
    this.ui.active = true;
    this.racingController.active = false;
    this.uiManager.openPopup();
    this.uiManager.setLabelPopup(this.betStateManager.showResult());
    this.racingController.getComponent('racingController').resetRacing();
    this.reJoinGame();
  }
}
