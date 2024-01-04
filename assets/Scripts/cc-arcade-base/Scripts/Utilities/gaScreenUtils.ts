export default class gaScreenUtils {
    static SAFE_CURVE_IPX = 20;

    static get NotchSize() : number {
        return cc.sys.os == cc.sys.OS_IOS ? 67 : 50;
    }

    public static isIPhoneX(): boolean {
        const iPhone = cc.sys.os == cc.sys.OS_IOS;
        const aspect = window.screen.width / window.screen.height;
        if (iPhone && aspect.toFixed(3) === "0.462") {
            return true;
        }
        return false;
    }

    public static getSafeY(): number {
        if (cc.sys.isMobile) {
            if (cc.sys.isBrowser && gaScreenUtils.isIPhoneX()) {
                return gaScreenUtils.isLandscapeScreen() ? 40 : 0;
            } else {
                const safeArea = cc.sys.getSafeAreaRect();
                return safeArea.y;
            }
        }
        return 0;
    }

    public static getOrientation(): number {
        if (cc.sys.isBrowser) {
            return window.orientation;
        } else if (jsb && jsb.device && typeof jsb.device.getDeviceOrientation == 'function') {
            return jsb.device.getDeviceOrientation();
        }
        return 0;
    }

    public static getNotchSize(extend?: boolean): number {
        gaScreenUtils.SAFE_CURVE_IPX = gaScreenUtils.NotchSize / 2;
        const extValue = extend ? gaScreenUtils.SAFE_CURVE_IPX : 0;

        if (cc.sys.isMobile && cc.sys.isBrowser) {
            if (!window || !document || !CSS) return 0;
            if (CSS.supports('padding-bottom: env(safe-area-inset-left)')) {
                const div = document.createElement('div');
                div.style.paddingLeft = 'env(safe-area-inset-left)';
                div.style.paddingTop = 'env(safe-area-inset-top)';
                div.style.paddingRight = 'env(safe-area-inset-right)';
                div.style.paddingBottom = 'env(safe-area-inset-bottom)';
                document.body.appendChild(div);

                const calculatedPaddingLeft = parseInt(window.getComputedStyle(div).paddingLeft, 10);
                const calculatedPaddingTop = parseInt(window.getComputedStyle(div).paddingTop, 10);
                const calculatedPaddingRight = parseInt(window.getComputedStyle(div).paddingRight, 10);
                document.body.removeChild(div);

                if (gaScreenUtils.isIPhoneX() && calculatedPaddingLeft > 0) {
                    return gaScreenUtils.NotchSize + extValue;
                }

                if (!gaScreenUtils.isLandscapeScreen()) {
                    if (calculatedPaddingTop > 0) {
                        return gaScreenUtils.NotchSize + extValue;
                    }
                } else if (calculatedPaddingLeft > 0 || calculatedPaddingRight > 0) {
                    return gaScreenUtils.NotchSize + extValue;
                }
            }
        }

        const safeArea = cc.sys.getSafeAreaRect();
        if (safeArea.x > 0) {
            return gaScreenUtils.NotchSize + extValue;
        }

        return 0;
    }

    public static isLandscapeScreen(): boolean {
        if (cc.sys.isBrowser) {
            if (window.matchMedia("(orientation: landscape)").matches) {
                return true;
            }
            if (window.matchMedia("(orientation: portrait)").matches) {
                return false;
            }
            return false;
        }
        return true;
    }
}
