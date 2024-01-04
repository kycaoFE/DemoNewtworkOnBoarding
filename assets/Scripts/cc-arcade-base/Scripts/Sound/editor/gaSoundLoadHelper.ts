const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class gaSoundLoadHelper extends cc.Component {
    @property(cc.String) assetPath: string = 'db://assets/cc-release-arcade/cc-xxx-/';

    _load: boolean = false;
    @property({ visible: true, serializable: true })
    get load() { return this._load; }
    set load(value: boolean) {
        this._load = value;
        if (value) {
            this.loadAssets();
            this._load = false;
        }
    }

    onLoad() {
        if (CC_EDITOR) {
            this.load = false;
        } else {
            this.destroy();
        }
    }

    loadAssets() {
        const soundPlayer = this.getComponent('gaSoundPlayer');
        const editor = window['Editor'];
        editor.assetdb.queryAssets(`${this.assetPath}/**/*.mp3`, null, (err: any, results: string | any[]) => {
            if (err) {
                cc.warn(err);
                return;
            }
            soundPlayer.lstSoundAsset = [];
            for (let index = 0; index < results.length; index++) {
                const element = results[index];
                cc.loader.load({
                    uuid: element.uuid,
                    type: cc.AudioClip
                } as any, (err: any, res: any) => {
                    if (err) {
                        cc.warn(err);
                        return;
                    }
                    soundPlayer.lstSoundAsset[index] = res;
                });
            }
        });
    }
}
