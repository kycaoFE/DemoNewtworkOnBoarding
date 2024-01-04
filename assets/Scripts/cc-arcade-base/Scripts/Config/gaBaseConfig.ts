const { ccclass, property } = cc._decorator;

@ccclass
export default class gaBaseConfig {

    static instance: gaBaseConfig = null;
    static gameId: string = "";
    static mainScene: string = "gaTemplateMain";
    static isIFrame: boolean = false;
    static isLoginOnOtherDevice : boolean = false;
    static NOTIFY_CHANNEL: string = "";
    static gameVersion: string = "";
    static designSize = {
        width: 1280,
        height: 720,
        maxWidth: 2000,
    };
    static visibleSize = {
        width: 1280,
        height: 720,
    };

    BETTING = {
        AutoRebet: false,
        AutoStartTime: 3,
    }

    destroy(): void {
        gaBaseConfig.instance = null;
    }

    POPUP_PROMPT = {
        JUST_CONFIRM_BUTTON: 'JUST_CONFIRM_BUTTON',
        CONFIRM_AND_CLOSE_BUTTON: 'CONFIRM_AND_CLOSE_BUTTON',
        CONFIRM_AND_REJECT_BUTTON: 'CONFIRM_AND_REJECT_BUTTON',
        NONE_BUTTON: 'NONE_BUTTON',
        ERROR_NETWORK: 'ERROR_NETWORK',
        SOCKET_DISCONNECT: 'SOCKET_DISCONNECT'
    };

    DIALOG_MSG_POS = {
        WITH_BTN: cc.v2(0, 36),
        NONE_BTN: cc.v2(0, 0)
    }

    static POPUP_TYPE = {
        HISTORY_BET: "history_bet",
        HISTORY_JP: 'history_jp',
        HELP: "help",
        SETTING: "setting",
        DIALOG: "dialog",
        TOAST: "toast",
    };

    NOTIFY_TYPE = {
        SYSTEM: '',
        BIGWIN: 'wat',
        JACKPOT: 'jpAmt'
    };

    NOTIFY_JACKPOT = {
        array_type_notify_jackpot: [this.NOTIFY_TYPE.JACKPOT, this.NOTIFY_TYPE.BIGWIN],
        limited_stack_size: 10,
    };

    NOTIFY_CONFIG = {
        [this.NOTIFY_TYPE.JACKPOT]: { userName: 0, goldReward: 1 },
        [this.NOTIFY_TYPE.BIGWIN]: { userName: 0, goldReward: 1 }
    };

    TouchDirectionAutoBot = cc.Enum({
        LEFT: 0,
        RIGHT: 1,
    });

    ScrollDirectionAutoBot = cc.Enum({
        LEFT: 0,
        RIGHT: 1,
    });

    TIMER_SCROLLER = {
        DATA_TIMER: ["0'", "30'", "60'", "90'", "120'", "∞"],
        MAX_TIME: 150,
        SPECIAL_ITEM: "i",
    };

    CURRENCY_CONFIG = {
        VND: {
            ACRONYM: "VND",
            DECIMAL_COUNT: 0,
            CURRENCY_PREFIX: "",
        },
        USD: {
            ACRONYM: "USD",
            DECIMAL_COUNT: 2,
            CURRENCY_PREFIX: "$",
        },
        CENT: {
            ACRONYM: "CENT",
            DECIMAL_COUNT: 0,
            CURRENCY_PREFIX: "¢",
        }
    };
}
