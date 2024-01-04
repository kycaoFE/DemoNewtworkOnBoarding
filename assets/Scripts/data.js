
export default class Data {
    constructor() {
        this.gameNumber = '';
        this.dataRoundCurrent = [];
    }

    setGameNumber(gameNumber) {
        this.gameNumber = gameNumber;
    }
}
Data.instance = null;
