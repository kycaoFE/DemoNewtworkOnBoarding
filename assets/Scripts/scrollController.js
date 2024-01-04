
cc.Class({
    extends: cc.Component,

    properties: {
        scrollNode: cc.Node,
        chip: cc.Node,
        nextButton: cc.Button,
        backButton: cc.Button,

        chipCurrent: Number,

        numChip: 3,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() { },

    start() {
        this.scrollNode.active = false;
        this.chipValues = [1, 10, 20, 50, 100];
        this.chipCurrent = 0;
        this.chipLabel = this.chip.getChildByName('Value Chip Label').getComponent(cc.Label);
        this.setValueChip(this.chipValues[this.chipCurrent]);
    },

    // update (dt) {},

    nextChip() {
        this.backButton.interactable = true;
        if (this.chipCurrent >= this.chipValues.length - 1) {
            this.nextButton.interactable = false;
            return;
        }
        this.chipCurrent++;
        this.setValueChip(this.chipValues[this.chipCurrent]);
    },

    backChip() {
        this.nextButton.interactable = true;
        if (this.chipCurrent <= 0) {
            this.backButton.interactable = false;
            return;
        }
        this.chipCurrent--;
        this.setValueChip(this.chipValues[this.chipCurrent]);
    },

    setValueChip(value) {
        this.chipLabel.string = value + 'K';
        cc.sys.localStorage.setItem('chipCurrent', value)
    },


});
