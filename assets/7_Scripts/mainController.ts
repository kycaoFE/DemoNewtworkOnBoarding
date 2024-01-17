const { ccclass, property } = cc._decorator;
import gaEventCode from "./cc-arcade-base/Scripts/Definitions/gaEventsCode";
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
    gaEventEmitter.instance.registerEvent(gaEventCode.NETWORK.WEB_SOCKET_OPEN, this.joinGame.bind(this));
  }

  start() {
    this.betStateManager = new BetStateManager();
    this.sendMessage = new SendMessage();
    this.network = new Network();
    this.uiManager = this.ui.getComponent("uiManager");
    this.uiManager.activeBettingArea(true);
    this.racingController.active = true;
    this.login();
  }

  login(): void {
    this.network.login(() => {
      this.uiManager.loginFailed();
    });
  }

  joinGame(): void {
    this.uiManager.loginSuccess();
    this.ui.active = false;
    this.scheduleOnce(()=>{
      this.sendMessage.joinGame((response: any) => {
        this.data = response;
        const ed = response.data.exD.ed;
        Data.instance.setGameNumber(ed.substr(ed.indexOf(':') + 1, 7));
        this.instantiateBetState();
        this.racingController.active = true;
      });
    }, 2)
  }

  getODDs(): void {
    this.oddsData = this.betStateManager.getODDs(this.data);
    this.uiManager.setLabelPopup(this.oddsData);
  }

  instantiateBetState(): void {
    this.ui.active = true;
    this.uiManager.closePopup();
    this.oddsData = (this.oddsData) ? this.oddsData : this.betStateManager.getODDs(this.data);
    this.betStateManager.instantiateBet(this.oddsData, this.oddsItemPrefab, this.betPools, this.betBackgroundPools);
  }

  bet(): void {
    const payload: any = this.betStateManager.bet(this.betPools);
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
    this.uiManager.activeBettingArea(false);
    this.uiManager.scrollUI(-850);
    this.racingController.active = true;
    this.racingController.getComponent('racingController').racing();
  }

  racingDone() {
    this.uiManager.openPopup();
    this.uiManager.setLabelPopup(this.betStateManager.showResult());
    this.scheduleOnce(()=>{
      this.uiManager.closePopup();
      this.uiManager.scrollUI(850);
      gaEventEmitter.instance.emit("prepareNextRound");
      this.uiManager.activeBettingArea(true);
    },2)
    this.reJoinGame();
  }
}
