import gaEventEmitter from "./cc-arcade-base/Scripts/Common/gaEventEmitter";
cc.Class({
    extends: cc.Component,

    onLoad () {
        if (gaEventEmitter.instance == null) {
            gaEventEmitter.instance = new gaEventEmitter();
        }
    },
});
