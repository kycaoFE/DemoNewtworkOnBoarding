export default class gaRoundData {
    userActive: number = 0;
    oddsConfigs: Record<string, number> = {};
    sessionId: string = "";
    commandId: string = "";
    gameNumber: string = "";

    constructor (data: any) {
        this.sessionId = data.id;
        this.commandId = data.cId;
    }
}
