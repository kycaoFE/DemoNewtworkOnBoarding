

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingController extends cc.Component {

    @property(cc.ProgressBar) loadingBar: cc.ProgressBar = null;
    @property(cc.Node) loadingController: cc.Node = null;
    @property(cc.Node) mainScene: cc.Node = null;

    // onLoad () {}

    start() {
        this.loadingBar.progress = 0;
        this.preloadMainScene();
    }

    preloadMainScene() {
        cc.director.preloadScene("MainScene", (completedCount, totalCount, item) => {
            var progress = (completedCount / totalCount);
            this.loadingBar.progress = progress;
        }, (error) => {
            if (!error) {
                this.loadMainScreen();
            } else {
                console.error(error);
            }
        });
    }

    loadMainScreen() {
        cc.game.addPersistRootNode(this.node);
        cc.director.loadScene("MainScene", (err, scene) => {
            cc.game.removePersistRootNode(this.node);
            if (err) return;
            const canvas: cc.Node = scene.getChildByName('Canvas');
            const mainRoot: cc.Node = canvas.getChildByName('root');
            mainRoot.setParent(this.mainScene);
            this.loadingController.active = false;
            this.loadingController.destroy();
            canvas.destroy();
            this.destroy();
        });
    }
}
