export default class gaLocalStorage {

    public static instance: gaLocalStorage = null;

    //#region ------------------------------------------------------------------ Declare variables
    private static KEY_LAST_ROUND = "ARCADE_LAST_ROUND";
    private static KEY_BET_DENOM = "ARCADE_BET_DENOM";
    private static KEY_TUTORIAL = "ARCADE_TUTORIAL";
    private static KEY_MODE_TURBO = "ARCADE_KEY_MODE_TURBO";
    private static KEY_LAST_CHIP = "KEY_LAST_CHIP";

    //#endregion

    //#region  ------------------------------------------------------------------ public functions

    public getLastResults(): any[] {
        return this._get(gaLocalStorage.KEY_LAST_ROUND) || [];
    }

    public saveLastResult(result: any): void {
        const results = this.getLastResults() || [];
        results.push(result);
        if (results.length > 5) results.shift();
        this._save(gaLocalStorage.KEY_LAST_ROUND, results);
    }

    public saveModeTurbo(isOn: boolean) {
        this._save(gaLocalStorage.KEY_MODE_TURBO, isOn);
    }

    public getModeTurbo(): boolean {
        return this._get(gaLocalStorage.KEY_MODE_TURBO);
    }

    public saveResults(results: any): void {
        this._save(gaLocalStorage.KEY_LAST_ROUND, results);
    }

    public getBetDenom(): number {
        return this._get(gaLocalStorage.KEY_BET_DENOM);
    }

    public saveBetDenom(denom: number): void {
        this._save(gaLocalStorage.KEY_BET_DENOM, denom);
    }

    public getTutorialEnable(): boolean {
        const data = this._get(gaLocalStorage.KEY_TUTORIAL);
        if (data && data.isPlayed) {
            return false;
        }
        return true;
    }

    public playedTutorial(): void {
        this._save(gaLocalStorage.KEY_TUTORIAL, { isPlayed: true });
    }

    public getLastChip(): { chipIndex: number, chooseIndex: number } {
        return this._get(gaLocalStorage.KEY_LAST_CHIP);
    }

    public saveLastChip(chip: { chipIndex: number, chooseIndex: number }): void {
        this._save(gaLocalStorage.KEY_LAST_CHIP, chip);
    }

    public destroy() {
        gaLocalStorage.instance = null;
    }

    //#endregion

    //#region  ----------------------------------------------------------------- private functions

    private _get(key: string): any {
        const localString = cc.sys.localStorage.getItem(key);
        if (localString) {
            try {
                return JSON.parse(localString);
            } catch (error) {
                return localString;
            }
        }

        return null;
    }

    private _save(key: string, data: any) {
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    //#endregion
}
