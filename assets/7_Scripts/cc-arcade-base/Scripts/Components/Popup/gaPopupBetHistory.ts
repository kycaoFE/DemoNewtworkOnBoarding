import gaDataStore from "../../Common/gaDataStore";
import gaBaseConfig from "../../Config/gaBaseConfig";
import gaPopupHistory from "./gaPopupHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupBetHistory extends gaPopupHistory {

    get popupType(): string { return gaBaseConfig.POPUP_TYPE.HISTORY_BET; }

    requestDataPage(callback: any, callbackErr: any): void {
        let newsize = this.itemPerPage;
        if (gaDataStore.instance.result) {
            newsize += 1;
        }
        const requestParams = {gameId: 'kts_' + gaBaseConfig.gameId, curPage: this.currentPage, size: newsize};
        super.requestDataPage(callback, callbackErr, requestParams);
    }

    onResponseData(res: any): void {
        super.onResponseData(res);
        if (res.error) return;
        
        const data = res.data;
        if (data) {
            const {resultList, totalPage, curPage} = data;
            this.totalPage = totalPage;
            if (resultList && resultList.length > 0) {
                if (gaDataStore.instance.result) {
                    const lsHistory = resultList.filter(it => it.gameNum != gaDataStore.instance.result.sessionId);
                    this.onValidData(lsHistory);
                } else {
                    this.onValidData(resultList);
                }
            } else {
                this.onEmptyData([]);
            }
        } else {
            this.onEmptyData([]);
        }
    }
}
