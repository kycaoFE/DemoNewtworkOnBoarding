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
    xFinish: number = 4660;
    racingDistance = 5060;
    minDuration: number = 10;
    layerDistance: Array<number> = [0, 0, 0, 0];
    timePrepare: number = 0.8;
    orh: Array<string> = [];

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
        // return this.orh;
    }

    getMoneyWin(): any {
        return Number((this.dataRoundCurrent.data.wg.split(';')[1])).toFixed();
        // return 0;
    }

    getOderBuffalo(buffaloNumber: string) {
        const oderFinish = this.getOderFinish();
        // const orderFinish = this.orh;
        return Number(oderFinish.indexOf(buffaloNumber));
    }

    // randomOrh(){
    //     this.orh = [];
    //     const orhBase = ['1','2','3','4','5','6'];
    //     for (let i = 0; i < 6; i++){
    //         const randomIndex = Number([Math.floor(Math.random() * (orhBase.length))]);
    //         this.orh.push(orhBase[randomIndex]);
    //         orhBase.splice(randomIndex, 1);
    //     }
    // }
}
