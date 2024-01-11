export class gaGameCMD {
    public static R_KEEP_ACTIVE = "player-active";
    public static R_JOIN_GAME = "jg";
    public static R_NEW_ODDS = "vspg";
    public static R_PLAY_GAME = "vsng";
    public static R_CLIENT_STATE = "glt";

    // response
    public static ON_JOIN_GAME_SUCCESS = "client-join-game-result";
    public static ON_STATE_UPDATE = "state-updated";
    public static ON_ODDS_UPDATE = "u";
    public static ON_PLAY_GAME = "n";
    public static ON_STATE_PUSH = "state-pushed";
    public static ON_WALLET_UPDATE = "wallet-updated";
    public static ERROR_PUSH = "error-pushed";
    public static JACKPOT_UPDATE = "jackpot-updated";
    public static JACKPOT_ANNOUNCEMENT = "JPA";
    public static JACKPOT_WIN = "jackpot-win";
    public static ON_NOTIFY = "bGw";

    protected static mapResponse: Record<string, string> = null;

    public static responseOf(request: string) {
        if (!this.mapResponse) {
            gaGameCMD.mapResponse = {};
            gaGameCMD.mapResponse[gaGameCMD.R_JOIN_GAME] = gaGameCMD.ON_JOIN_GAME_SUCCESS;
            gaGameCMD.mapResponse[gaGameCMD.R_CLIENT_STATE] = gaGameCMD.ON_STATE_PUSH;
            gaGameCMD.mapResponse[gaGameCMD.R_NEW_ODDS] = gaGameCMD.ON_ODDS_UPDATE;
            gaGameCMD.mapResponse[gaGameCMD.R_PLAY_GAME] = gaGameCMD.ON_PLAY_GAME;
        }
        return this.mapResponse[request];
    }
}
