import gaUtils from "../Utilities/gaUtils";
import gaMapKeyConfig from "../Config/gaMapKeyConfig";
import gaBaseConfig from "../Config/gaBaseConfig";

const { ccclass, property } = cc._decorator;

export enum POPUP_ANIMATION {
    DEFAULT = 0,
    FADE = 1,
    PULSE = 2,
    TOP_DOWN = 3,
    BOTTOM_UP = 4,
    FROM_LEFT = 5,
    FROM_RIGHT = 6
};

@ccclass
export class gaNotifyConfig {
    @property({ serializable: true })
    animAppear: string = '';

    @property({ serializable: true })
    animIdle: string = '';

    @property({ serializable: true })
    animDisappear: string = '';

    @property({ visible: true })
    languageKey: string = 'txtJPNotify';

    @property(sp.SkeletonData)
    spineData: sp.SkeletonData = null;

    @property({ visible: true })
    type: string = '';
}

@ccclass('gaStylePopupAnimation')
export class gaStylePopupAnimation {
    @property({ type: cc.Enum(POPUP_ANIMATION) }) show: POPUP_ANIMATION = POPUP_ANIMATION.DEFAULT;
    @property({ type: cc.Enum(POPUP_ANIMATION) }) hide: POPUP_ANIMATION = POPUP_ANIMATION.DEFAULT;
}

export abstract class gaBaseHistoryInfo {
    merge(data: any) {
        if (data) {
            gaUtils.mergeTwoObject(this, gaUtils.replaceObjectKeys(data, gaMapKeyConfig), this);
        }
    }
}

export class gaBetInfo extends gaBaseHistoryInfo {
    betAmount: number = 0;
    rate: number = 0;
    type: number = 0;
    winAmount: number = 0;
    constructor(data: any) {
        super();
        this.merge(data);
    }

    merge(data: any) {
        if (data) {
            super.merge(data);
            if (!this.winAmount) {
                if (data.winAmt > 0) {
                    this.winAmount = data.winAmt;
                } else {
                    this.winAmount = data.win;
                }
                delete this['win'];
                delete this['winAmt'];
            }
        }
    }
}

export abstract class gaHistoryData extends gaBaseHistoryInfo {
    from: number = 0;
    total: number = 0;
    resultList: gaBaseHistoryInfo[] = [];
    constructor(data) {
        super();
        if (data) {
            this.from = data.from;
            this.total = data.total;
        }
    }
}

export class gaBetHistoryDataItem extends gaBaseHistoryInfo {
    gameNumber: string = '';
    winAmount: number = 0;
    betAmount: number = 0;
    items: gaBetInfo[] = [];
    timeStamp: number = 0;

    constructor(data: any) {
        super();
        this.merge(data);
    }

    merge(data: any) {
        super.merge(data);
        if (data && data.items) {
            this.items = data.items.map(element => new gaBetInfo(element));
        }
    }
}

export class gaJPHistoryDataItem extends gaBaseHistoryInfo {
    jackpotAmount: number = 0;
    displayName: string = '';
    timeStamp: number = 0;

    constructor(data: any) {
        super();
        this.merge(data);
    }
}

export class gaNotifyData {
    commandId: string;
    username: string;
    type: string;
    winAmount: number;
    constructor(data: any) {
        this.commandId = data.cmdId;
        this.username = data.usr;
    }
}