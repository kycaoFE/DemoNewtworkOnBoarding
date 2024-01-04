import gaBaseConfig from "../../Config/gaBaseConfig";
import gaPopupHistory from "./gaPopupHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class gaPopupJackpotHistory extends gaPopupHistory {
    get popupType(): string { return gaBaseConfig.POPUP_TYPE.HISTORY_JP; }

    requestDataPage(callback: Function, callbackErr: Function): void {
        const requestParams = { serviceId: gaBaseConfig.gameId, from: (this.currentPage - 1) * this.itemPerPage + 1, size: this.itemPerPage, type: 'GRAND' };
        super.requestDataPage(callback, callbackErr, requestParams);
    }

    onResponseData(res: any): void {
        super.onResponseData(res);
        if (res.total) {
            this.totalPage = Math.ceil(res.total / this.itemPerPage);
        }
        if (res.error) return;

        if (Object.keys(res).length > 0 && res.data && res.data.length > 0) {
            this.onValidData(res.data);
        }
        else {
            this.onEmptyData([]);
        }
    }
}
