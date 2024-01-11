const { ccclass, property } = cc._decorator;

@ccclass
export default class gaLocalize {

    static instance: any = null;

    initLocalizeConfig(jsonLocalize) {
        const localize = jsonLocalize;
        if (!localize) {
            return;
        }
        for (let key in localize) {
            gaLocalize.instance[key] = localize[key];
        }
    }

    destroy(): void {
        gaLocalize.instance = null;
    }
}
