import gaBaseConfig from "../Config/gaBaseConfig";
import logger from "../Utilities/gaLogger";
import gaTweenUtils from "../Utilities/gaTweenUtils";
import gaUtils from "../Utilities/gaUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaLoadingScene extends cc.Component {

    //#region ------------------------------------------------------------------ Declare variables

    @property(cc.ProgressBar) private progressBar: cc.ProgressBar = null;
    @property(cc.Node) private iconProgressBar: cc.Node = null;
    @property(cc.Node) private rootMainScene: cc.Node = null;
    @property(cc.Node) private rootLoading: cc.Node = null;

    private _progress: number = 0;
    private _loadedPercentage: number = 0;
    private _loadedMainScene: boolean = false;

    static instance: gaLoadingScene = null;

    //#endregion

    //#region  --------------------------------------------------------------- Component functions

    protected onLoad(): void {
        gaLoadingScene.instance = this;

        this.progressBar.progress = 0;
        if (cc.sys.isNative) {
            this.rootLoading.active = false;
            this.enabled = false;
            this.scheduleOnce(() => {
                this.rootLoading.active = true;
                this.enabled = true;
            }, 0.25);
        }
        if (!CC_PREVIEW || cc.sys.isMobile) {
            cc.debug.setDisplayStats(false);
        }
    }

    protected start(): void {
        cc.director.preloadScene(gaBaseConfig.mainScene, (completedCount: number, totalCount: number) => {
            this._loadedPercentage = completedCount / totalCount;
        }, () => {
            this._loadedPercentage = 1;
        });
    }

    protected lateUpdate(): void {
        if (this._loadedMainScene) {
            return;
        }
        let delta = (this._loadedPercentage - this.progressBar.progress);

        delta = gaUtils.clamp(delta, 0.001, 0.01);
        if (delta > 0) {
            this._progress += delta;
            this.progressBar.progress = gaUtils.clamp(this._progress, this.progressBar.progress, 1);
            if (this.iconProgressBar) {
                this.iconProgressBar.x = this.progressBar.progress * this.progressBar.node.width;
            }
        }

        if (this.progressBar.progress >= 0.98) {
            this._loadMainScene();
        }
    }

    protected onDestroy(): void {
        gaLoadingScene.instance = null;
    }

    //#endregion

    //#region  ------------------------------------------------------------------ public functions

    public hide() {
        logger.debug("Hide Loading Scene");
        gaTweenUtils.fadeOut(this.rootLoading, 0.5, () => {
            this.rootLoading.destroy();
            this.destroy();
        });
    }

    //#endregion


    //#region  ----------------------------------------------------------------- private functions

    private _loadMainScene() {
        if (this._loadedMainScene) {
            return;
        }
        this._loadedMainScene = true;
        cc.game.addPersistRootNode(this.node);
        cc.director.loadScene(gaBaseConfig.mainScene, (err, scene) => {
            cc.game.removePersistRootNode(this.node);
            if (err) return;
            const canvas: cc.Node = scene.getChildByName('Canvas');
            const mainRoot: cc.Node = canvas.getChildByName('root');
            mainRoot.setParent(this.rootMainScene);
            canvas.destroy();
        });
    }

    //#endregion
}
