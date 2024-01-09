const { ccclass, property } = cc._decorator;

@ccclass
export class ccData extends cc.Component {

    public static instance: ccData = null;

    public red = new cc.Color(255, 0, 0);
    public green = new cc.Color(0, 255, 0);
    public yellow = new cc.Color(255, 255, 0);
    public white = new cc.Color(255, 255, 255);

}

export class Data {
    public static instance: Data = null;
    gameNumber: string = '';
    dataRoundCurrent: any = [];
    chipCurrentValues: number = null;
    xStart: number = -400;
    xFinish: number = 4600;
    minDuration: number = 10;

    setGameNumber(gameNumber: any): any {
        this.gameNumber = gameNumber;
    }

    getBuffalosWin(): any {
        const data = this.dataRoundCurrent.data;
        const buffalosWin = (data.orh[0] < data.orh[1]) ? data.orh[0] + data.orh[1] : data.orh[1] + data.orh[0];
        return buffalosWin;
    }

    getOderFinish(): any {
        return this.dataRoundCurrent.data.orh;
    }

    getMoneyWin(): any {
        return Number((this.dataRoundCurrent.data.wg.split(';')[1])).toFixed();
    }

    getOderBuffalo(buffaloNumber: string) {
        const oderFinish = this.getOderFinish();
        return Number(oderFinish.indexOf(buffaloNumber));
    }
}
