import gaBaseConfig from "../Config/gaBaseConfig";
import gaDataStore from "./gaDataStore";

const { formatMoney, formatCoin, updateUtilConfig } = require("utils");
const Big = require("big");

export default class gaCurrencyCalculator {
    public static instance: gaCurrencyCalculator = null;

    // override this to update new money key
    _listMoneyKey = ["Wallet", "GoldReward", "WinAmount", "TotalReward"];

    updateKeyMoneyInCurrencyData(content, convertToDefault = true) {
        // Check all field in Content to find Money Key and Convert
        if (content === undefined || content === null) {
            return content;
        }

        if (Array.isArray(content)) {
            content.forEach(elm => this.updateKeyMoneyInCurrencyData(elm, convertToDefault));
        } else if (typeof content === 'object') {
            Object.keys(content).forEach(key => {
                const val = content[key];
                if (this.isInListMoneyKey(key)) {
                    content[key] = convertToDefault ? this.convertToDefaultCurrency(val) : this.convertToUserCurrency(val);
                } else if (Array.isArray(val)) {
                    content[key].forEach((elm: any) => this.updateKeyMoneyInCurrencyData(elm, convertToDefault));
                } else if (typeof val === 'object') {
                    content[key] = this.updateKeyMoneyInCurrencyData(val, convertToDefault);
                }
            });
        }
        return content;
    }

    // Utilities
    isInListMoneyKey(key: string) {
        return this._listMoneyKey.includes(key);
    }

    isDefaultCurrency() {
        return gaDataStore.instance.getCurrencyRatio() === 1;
    }

    formatCurrency(value: number): string {
        value = +value;
        let stringResult = value.toString();
        let targetTypeCurrency = gaDataStore.instance.getUserTypeOfCurrency();
        let CURRENCY_CONFIG = gaBaseConfig.instance.CURRENCY_CONFIG[targetTypeCurrency];
        if (!CURRENCY_CONFIG) {
            cc.error("No Currency Config");
            return;
        }
        updateUtilConfig("CURRENCY_CONFIG", CURRENCY_CONFIG);
        switch (targetTypeCurrency) {
            case gaBaseConfig.instance.CURRENCY_CONFIG.USD.ACRONYM:
                if (value < 0.5 && value > 0) {
                    // if value < 0.5 change USD to Cent
                    targetTypeCurrency = gaBaseConfig.instance.CURRENCY_CONFIG.CENT.ACRONYM;
                    CURRENCY_CONFIG = gaBaseConfig.instance.CURRENCY_CONFIG[targetTypeCurrency];
                    updateUtilConfig("CURRENCY_CONFIG", CURRENCY_CONFIG);
                    value = this.multiplyTwoNumber(value, 100);
                }
                stringResult = formatMoney(value, 2);
                break;
            case gaBaseConfig.instance.CURRENCY_CONFIG.VND.ACRONYM:
            default:
                stringResult = formatCoin(value);
                break;

        }
        return stringResult;

    }

    convertToUserCurrency(val: number): number  {
        const ratio = gaDataStore.instance.getCurrencyRatio();
        let result = this.divideTwoNumber(val, ratio);
        return result;
    }

    convertToDefaultCurrency(val: number) {
        const ratio = gaDataStore.instance.getCurrencyRatio();
        let result = this.multiplyTwoNumber(val, ratio);
        return result;
    }

    //Calculator float number
    plusTwoNumber(firstNum: number, secondNum: any) {
        const _firstNum = new Big(firstNum);
        const _secondNum = new Big(secondNum);
        return +_firstNum.plus(_secondNum);
    }

    minusTwoNumber(firstNum: number, secondNum: number) {
        const _firstNum = new Big(firstNum);
        const _secondNum = new Big(secondNum);
        return +_firstNum.minus(_secondNum);
    }

    divideTwoNumber(firstNum: number, secondNum: number) {
        const _firstNum = new Big(firstNum);
        const _secondNum = new Big(secondNum);
        return +_firstNum.div(_secondNum);
    }

    multiplyTwoNumber(firstNum: number, secondNum: number) {
        const _firstNum = new Big(firstNum);
        const _secondNum = new Big(secondNum);
        return +_firstNum.times(_secondNum);
    }

    destroy() {
        gaCurrencyCalculator.instance = null;
    }
}
