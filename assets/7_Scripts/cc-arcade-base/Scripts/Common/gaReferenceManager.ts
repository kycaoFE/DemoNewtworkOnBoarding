import gaSoundPlayer from "../Sound/gaSoundPlayer";

export default class gaReferenceManager {
    public static instance: gaReferenceManager = null;

    public btnFullScreen: cc.Node = null;
    public gameView: cc.Node = null;
    public soundPlayer: cc.Node = null;
    public betPanel: cc.Node = null;
    public jackpotPanel: cc.Node = null;

    setReference(key: string, node: cc.Node): void {
        this[key] = node;
    }

    public getSoundPlayer(): gaSoundPlayer {
        return this.soundPlayer.getComponent('gaSoundPlayer');
    }

    destroy(): void {
        if (gaReferenceManager.instance) {
            gaReferenceManager.instance = null;
        }
    }
}
