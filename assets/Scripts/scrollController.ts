import { Data } from "./data";

const { ccclass, property } = cc._decorator;

@ccclass
export default class scrollController extends cc.Component {
  @property(cc.Node) scrollNode: cc.Node = null;
  @property(cc.Node) chip: cc.Node = null;
  @property(cc.Button) nextButton: cc.Button = null;
  @property(cc.Button) backButton: cc.Button = null;
  @property(cc.Label) chipLabel: cc.Label = null;

  private chipCurrent: number = 0;
  private numChip: number = 3;
  private chipValues: Array<number> = [1, 10, 20, 50, 100];

  start() {
    this.scrollNode.active = false;
    this.setValueChip(this.chipValues[this.chipCurrent]);
    this.nextButton.node.on("click", this.nextChip.bind(this));
    this.backButton.node.on("click", this.backChip.bind(this));
  }

  nextChip(): void {
    this.backButton.interactable = true;
    if (this.chipCurrent >= this.chipValues.length - 1) {
      this.nextButton.interactable = false;
      return;
    }
    this.chipCurrent++;
    this.setValueChip(this.chipValues[this.chipCurrent]);
  }

  backChip() {
    this.nextButton.interactable = true;
    if (this.chipCurrent <= 0) {
      this.backButton.interactable = false;
      return;
    }
    this.chipCurrent--;
    this.setValueChip(this.chipValues[this.chipCurrent]);
  }

  setValueChip(value) {
    this.chipLabel.string = value + "K";
    Data.instance.chipCurrentValues = value;
  }
}
