import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";

const { ccclass } = cc._decorator;

@ccclass
export default class mEmiter extends cc.Component {
    onLoad () {
        if (gaEventEmitter.instance == null) {
            gaEventEmitter.instance = new gaEventEmitter();
        }
    }
}