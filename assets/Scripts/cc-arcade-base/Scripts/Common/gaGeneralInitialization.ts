import gaBaseConfig from "../Config/gaBaseConfig";
import gaEventsCode from "../Definitions/gaEventsCode";
import gaCurrencyCalculator from "./gaCurrencyCalculator";
import gaDataFactory from "./gaDataFactory";
import gaDataStore from "./gaDataStore";
import gaEventEmitter from "./gaEventEmitter";
import gaLocalStorage from "./gaLocalStorage";
import gaLocalize from "./gaLocalize";
import gaReferenceManager from "./gaReferenceManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaGeneralInitialization extends cc.Component {

    @property(cc.JsonAsset)
    jsonLocalize: cc.JsonAsset = null;

    protected onLoad(): void {
        cc.game.addPersistRootNode(this.node);
        this.initInstances();
        this.baseInitInstances();
        gaEventEmitter.instance.registerEvent(gaEventsCode.COMMON.REFRESH_PAGE, this.refreshPage, this);
    }

    public refreshPage(){
        cc.game.removePersistRootNode(this.node);
        this.node.destroy();
    }

    protected onDestroy(): void {
        this.destroyInstances();
    }

    protected initInstances(): void {}

    protected baseInitInstances(): void {
        if (gaEventEmitter.instance == null) {
            gaEventEmitter.instance = new gaEventEmitter();
        }

        if (gaReferenceManager.instance == null) {
            gaReferenceManager.instance = new gaReferenceManager();
        }

        if (gaDataFactory.instance == null) {
            gaDataFactory.instance = new gaDataFactory();
        }

        if (gaLocalize.instance == null) {
            gaLocalize.instance = new gaLocalize();
            gaLocalize.instance.initLocalizeConfig(this.jsonLocalize.json);
        }

        if (gaBaseConfig.instance == null) {
            gaBaseConfig.instance = new gaBaseConfig();
        }

        if (gaDataStore.instance == null) {
            gaDataStore.instance = new gaDataStore();
        }

        if (gaCurrencyCalculator.instance == null) {
            gaCurrencyCalculator.instance = new gaCurrencyCalculator();
        }

        if (gaLocalStorage.instance == null) {
            gaLocalStorage.instance = new gaLocalStorage();
        }
    }

    protected destroyInstances() {
        if (gaEventEmitter.instance) {
            gaEventEmitter.instance.destroy();
        }

        if (gaLocalize.instance) {
            gaLocalize.instance.destroy();
        }

        if (gaBaseConfig.instance) {
            gaBaseConfig.instance.destroy();
        }

        if (gaDataStore.instance) {
            gaDataStore.instance.destroy();
        }

        if (gaCurrencyCalculator.instance) {
            gaCurrencyCalculator.instance.destroy();
        }

        if (gaLocalStorage.instance) {
            gaLocalStorage.instance.destroy();
        }
    }

}
