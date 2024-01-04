const { formatMoney, formatWalletMoney } = require('utils');
const lodash = require('lodash');

export default class gaUtils {
    static readonly numberSeparator: string = ",";
    static readonly digitSeparator: string = ".";

    public static get TIME_SCALE(): number {
        return gaUtils._TIME_SCALE;
    }
    private static _TIME_SCALE: number = 1;

    static setTimeScale(timeScale: number): void {
        gaUtils._TIME_SCALE = timeScale;
        cc.director['calculateDeltaTime'] = function (now: number) {
            if (!now) now = performance.now();
            this._deltaTime = (now - this._lastUpdate) / 1000;
            if (CC_DEBUG && (this._deltaTime > 1)) {
                this._deltaTime = 1 / 60.0;
            }

            this._deltaTime *= timeScale;
            this._lastUpdate = now;
        };
    }

    static hitTest(node: cc.Node, loccation: any): boolean {
        return node['_hitTest'](loccation);
    }

    static changeParent(child: cc.Node, newParent: cc.Node) {
        if (newParent === child.parent) return;
        const worldPos = child.convertToWorldSpaceAR(cc.v2(0, 0));
        const newPos = newParent.convertToNodeSpaceAR(worldPos);
        child.parent = newParent;
        child.setPosition(newPos);
    }

    static getWorldPos(node: cc.Node) {
        return node.convertToWorldSpaceAR(cc.v2(0, 0));
    }

    static getLocalPos(container: cc.Node, worldPos: cc.Vec2) {
        return container.convertToNodeSpaceAR(worldPos);
    }

    static updateSpineTime(spine: sp.Skeleton, dt: number) {
        if (cc.sys.isNative) {
            spine['_updateRealtime'](dt);
        } else {
            spine['update'](dt);
        }
    }

    static getParam(url: string, key: string): string {
        if (url.indexOf("&" + key + "=") != -1)
            return url.split("&" + key + "=")[1].split("&")[0];
        if (url.indexOf("?" + key + "=") != -1)
            return url.split("?" + key + "=")[1].split("&")[0];
        return null;
    }

    static stopTweens(tweens: cc.Tween[]) {
        if (tweens && Array.isArray(tweens)) {
            tweens.forEach(gaUtils.stopTween);
            tweens.length = 0;
        }
    }

    static stopTween(tween: cc.Tween) {
        if (tween) {
            gaUtils.stopAllByTarget(tween['_target']);
        }
    }

    static stopAllByTarget(_target: any) {
        cc.director.getActionManager().removeAllActionsFromTarget(_target, true);
    }

    static setOpacity(node: cc.Node, value: number) {
        const opacity = node;
        opacity.opacity = value;
    }

    static getLast<T>(array: Array<T>): T {
        if (!array || !array.length) return null;
        return array[array.length - 1];
    }

    static getTimeString(timestamp: string | number): string {
        const padStart = (value: string | number) => {
            return ('0' + value).slice(-2);
        }
        const date = new Date(Number(timestamp));
        const DD = padStart(date.getDate());
        const MM = padStart(date.getMonth() + 1);
        const hh = padStart(date.getHours());
        const mm = padStart(date.getMinutes());
        const ss = padStart(date.getSeconds());
        return `${DD}/${MM} ${hh}:${mm}:${ss}`;
    }

    static shortName(name: string, max: number): string {
        if (name.length > max) {
            return name.substring(0, max) + "...";
        }

        return name;
    }

    static secondsToHHMMSS(seconds: number, stringSeperate: string = ':'): string {
        if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
            throw new Error('seconds must be a valid, positive number');
        }

        if (typeof stringSeperate !== 'string') {
            throw new Error('stringSeperate must be a valid string');
        }

        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor(seconds / 60) % 60;
        let second = seconds % 60;

        return `${hours}${stringSeperate}${("0" + minutes).slice(-2)}${stringSeperate}${("0" + second).slice(-2)}`;
    }

    static clamp(x: number, min: number, max: number): number {
        return lodash.clamp(x, min, max);
    };

    static getSum(array: number[]): number {
        if (!array || !array.length) return 0;
        return lodash.sum(array);
    }

    static flatten(arrays: any[]): any[] {
        return lodash.flatten(arrays);
    }

    public static randomNumber(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    public static randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public static randomBoolean(trueRate = 0.5) {
        return Math.random() < trueRate;
    }

    public static randomFromArray(arr: any[], excludedElement: any = null): any {
        if (!arr || !arr.length) return null;
        if (excludedElement != null) {
            const eligibleElements = arr.filter((element: any) => element !== excludedElement);
            const randomIndex = Math.floor(Math.random() * eligibleElements.length);
            const randomElement = eligibleElements[randomIndex];
            return randomElement;
        }
        return arr[gaUtils.randomInt(0, arr.length)];
    }

    public static shuffleArray<T>(array: T[]): T[] {
        if (array.length === 0) {
            return array;
        }
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[i]];
        }
        return shuffledArray;
    }

    public static getDistance(p1: cc.Vec2, p2: cc.Vec2): number {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    // full number
    public static formatMoney(amount: number, decimalPlaces: number = 0, decimal = ".", thousands = ","): string {
        return formatMoney(amount, decimalPlaces, decimal, thousands);
    }

    // short number with symbol K, M, B, T
    public static formatWallet(amount: number, decimalPlaces: number = 0, trimZero: boolean = true): string {
        return formatWalletMoney(amount, decimalPlaces, trimZero);
    }

    static formatUserName(userName: string = '', maxLength: number = 14, replaceText: string = "...") {
        if (userName.length <= maxLength) return userName;
        return userName.slice(0, maxLength - replaceText.length + 1) + replaceText;
    }

    public static mergeTwoObject<U, V>(obj1: U, obj2: V, out?: U & V): U & V {
        out = out || {} as U & V;
        return lodash.merge(out, obj1, obj2);
    }

    public static cloneDeep<T>(obj: T): T {
        return lodash.cloneDeep(obj);
    }

    public static destroyAllChildren(node: cc.Node) {
        if (!cc.isValid(node)) return;
        for (let index = node.children.length - 1; index >= 0; index--) {
            const element = node.children[index];
            if (cc.isValid(element)) {
                element.removeFromParent();
                element.destroy();
            }
        }
    }

    public static replaceObjectKeys(obj: object, config: Record<string, string>): object {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                let element = obj[key];
                if (config[key]) {
                    obj[config[key]] = element;
                    delete obj[key];
                    element = obj[config[key]];
                }
                if (element && typeof element === 'object') {
                    gaUtils.replaceObjectKeys(element, config);
                }
                if (Array.isArray(element)) {
                    element.forEach((item: any) => {
                        if (typeof item === 'object') {
                            gaUtils.replaceObjectKeys(item, config);
                        }
                    });
                }
            }
        }
        return obj;
    }

    public static formatCurrency(amount: number, decimalPlaces: number = 0): string {
        const [integerPart, fractionalPart = ''] = gaUtils.formatNumberWithoutRounding(amount, decimalPlaces).split('.');
        let result = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, gaUtils.numberSeparator);
        if (fractionalPart) {
            result += gaUtils.digitSeparator + fractionalPart;
        }
        return result;
    }

    public static formatNumberWithoutRounding(num: number, decimalPlaces: number): string {
        let multiplier = 10 ** decimalPlaces;
        return (Math.floor(num * multiplier) / multiplier).toString();
    }
}
