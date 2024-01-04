cc.Class({
    extends: cc.Component,

    properties: {
        betValue: 0,
        betTime: 0,

        betLabel: cc.Label,
        betButtonBackground: cc.Node,

        red: new cc.Color(255, 0, 0),
        green: new cc.Color(0, 255, 0),
        yellow: new cc.Color(255, 255, 0)
    },

    bet() {
        let chipValueBet = cc.sys.localStorage.getItem('chipCurrent');
        this.betValue += Number(chipValueBet);
        this.setValueLabel(this.numBuffalos, this.oddValue, this.betValue + 'K');
        this.setColorButtonBackground(this.yellow);
    },

    getBet() {
        if (this.betValue <= 0) return;
        return this.node.name + ':' + this.betValue;
    },

    setValueLabel(numBuffalos, oddValue, moneyBet) {
        this.numBuffalos = numBuffalos;
        this.oddValue = oddValue;
        this.betLabel.string = `Cặp Bò: ` + numBuffalos + ` x` + oddValue
            + `\n` + moneyBet;
    },

    setBetButtonBackground(node) {
        this.betButtonBackground = node;
    },

    setColorButtonBackground(color) {
        this.betButtonBackground.color = color;
    }
});
