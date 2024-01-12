

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.ProgressBar) loadingBar: cc.ProgressBar = null;


    // onLoad () {}

    start () {
        this.loadingBar.progress = 0;
        this.loadMainScreen();
    }

    // update (dt) {}

    loadMainScreen(){
        var isLoaded: boolean = false;
        cc.director.preloadScene("MainScene", (completedCount, totalCount, item) => {
            var progress = (completedCount / totalCount)*100;
            this.loadingBar.progress = progress;
            if(progress >= 0.9 && !isLoaded) {
                isLoaded = true;
                this.node.parent = null;
                cc.game.addPersistRootNode(this.node);
                this.node.x = 640;
                this.node.y = 360;
                cc.director.loadScene("MainScene");
                this.scheduleOnce(()=>{
                    cc.game.removePersistRootNode(this.node);
                    this.node.destroy();
                },1)
            }
            }, (error) => {
                if (!error) {
                    
                } else {
                    console.error(error);
                }
        });
    }
}
