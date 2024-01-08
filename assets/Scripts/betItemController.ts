import { Data, ccData } from './data';
const { ccclass, property } = cc._decorator;

@ccclass
export default class betItemController extends cc.Component {

    private betValue: number = 0;
    private numBuffalos: string = '';
    private oddValue: string = '';

    @property(cc.Label) betLabel: cc.Label = null;
    @property(cc.Node) betButtonBackground: cc.Node = null;

    bet(): void {
        let chipValueBet = Data.instance.chipCurrentValues;
        this.betValue += Number(chipValueBet);
        this.setValueLabel(this.numBuffalos, this.oddValue, this.betValue);
        this.setColorButtonBackground(ccData.instance.yellow);
    }

    getBet(): string {
        if (this.betValue <= 0) return;
        return this.node.name + ':' + this.betValue;
    }

    setValueLabel(numBuffalos: string, oddValue: string, moneyBet: number): void {
        this.numBuffalos = numBuffalos;
        this.oddValue = oddValue;
        const moneyBetString = (moneyBet>0)? moneyBet+`K`:'';
        this.betLabel.string = `Cặp Bò: ` + numBuffalos + ` x` + oddValue
            + `\n` + moneyBetString;
    }

    setBetButtonBackground(node: cc.Node) {
        this.betButtonBackground = node;
    }

    setColorButtonBackground(color: cc.Color) {
        this.betButtonBackground.color = color;
    }

    resetBetValue(){
        this.betValue = 0;
        this.setValueLabel(this.numBuffalos, this.oddValue, 0);
        this.setColorButtonBackground(ccData.instance.white);
    }

}
