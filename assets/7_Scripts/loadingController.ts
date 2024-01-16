

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.ProgressBar) loadingBar: cc.ProgressBar = null;
    @property(cc.Node) loadingController: cc.Node = null;
    @property(cc.Node) mainScene: cc.Node = null;

    // onLoad () {}

    start() {
        this.loadingBar.progress = 0;
        this.loadMainScreen();
    }

    preloadMainScene() {
        var isLoaded = false;
        cc.director.preloadScene("MainScene", (completedCount, totalCount) => {
            var progress = (completedCount / totalCount) * 100;
            this.loadingBar.progress = progress;
            if (progress >= 0.9 && !isLoaded) {
                isLoaded = true;
                this.loadMainScreen();
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
