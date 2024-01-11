import gameService from "../../Network/gaGameService";
import gaArcadeBaseTableHistory from "../History/gaArcadeBaseTableHistory";
import gaMultipagePopups from "./gaMultipagePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract default class gaPopupHistory extends gaMultipagePopups {

    @property(gaArcadeBaseTableHistory)
    tableHistory: gaArcadeBaseTableHistory = null;

    @property(cc.Node)
    loadingAnim: cc.Node = null;

    @property(Number)
    itemPerPage: number = 7;

    @property(cc.Button)
    btnNext: cc.Button = null;

    @property(cc.Button)
    btnBack: cc.Button = null;

    @property(cc.Node)
    historyEmpty: cc.Node = null;


    @property({serializable: true})
    historyUrl: string = "";

    pageDefault: number = 1;

    onLoad(): void {
        super.onLoad();
        this.initMultipage();
    }

    initMultipage() {
        this.updatePageNumber(1);
        this.updatePageTotal(1);
        this.stopLoading();
        this.tableHistory.initCells(this.itemPerPage);
        this.historyEmpty && (this.historyEmpty.active = false);

        this.btnNext.node.on(cc.Node.EventType.TOUCH_END, this.cancelChangePage, this);
        this.btnNext.node.on(cc.Node.EventType.TOUCH_CANCEL, this.cancelChangePage, this);

        this.btnBack.node.on(cc.Node.EventType.TOUCH_END, this.cancelChangePage, this);
        this.btnBack.node.on(cc.Node.EventType.TOUCH_CANCEL, this.cancelChangePage, this);
    }

    show(data?: any): void {
        super.show();
        this.tableHistory.clearData();
        this.openPanel();
    }

    cancelChangePage() {
        if (this.currentPage !== 1) {
            this.btnBack.interactable = true;
        }
        if (this.currentPage < this.totalPage) {
            this.btnNext.interactable = true;
        }
    }

    openPanel() {
        this.node.active = true;
        this.node.opacity = 255;
        this.tableHistory.node.opacity = 0;
        this.currentPage = 1;
        this.btnBack.interactable = false;
        this.btnNext.interactable = false;
        this.updatePageNumber(this.currentPage);
        this.updatePageTotal(this.totalPage);
        this.changePage();
    }

    playLoading() {
        if (this.loadingAnim) {
            this.loadingAnim.active = true;
        }
        this.historyEmpty && (this.historyEmpty.active = false);
    }

    stopLoading() {
        this.unschedule(this.playLoading);
        if (this.loadingAnim) {
            this.loadingAnim.active = false;
        }
    }

    nextPage() {
        super.nextPage();
        if (this.currentPage == this.totalPage) {
            return;
        }
        this.btnNext.interactable = false;
        this.currentPage += 1;
        this.changePage();
    }

    prevPage() {
        super.prevPage();
        if (this.currentPage == 1) {
            return;
        }
        this.btnBack.interactable = false;
        this.currentPage -= 1;
        this.changePage();
    }

    changePage() {
        this.scheduleOnce(this.playLoading, 1);
        this.requestDataPage(this.onResponseData.bind(this), this.onErrorData.bind(this));
    }

    requestDataPage(callback: Function, callbackErr: Function, requestParams: any = {}): void {
        gameService.getHistory(this.historyUrl, requestParams)
            .then((resp) => {
                callback(resp);
            })
            .catch((error) => {
                callbackErr();
            });
    }

    onResponseData(res: any): void {
        this.stopLoading();
    }

    onValidData(data: any): void {
        this.btnNext.interactable = true;
        this.btnBack.interactable = true;

        if (this.currentPage == 1) {
            this.btnBack.interactable = false;
        }
        if (this.currentPage == this.totalPage) {
            this.btnNext.interactable = false;
        }
        this.historyEmpty && (this.historyEmpty.active = false);
        this.updatePageNumber(this.currentPage);
        this.updatePageTotal(this.totalPage);
        this.setFramePageState(true);
        this.tableHistory.node.opacity = 255;
        this.tableHistory.updateData(data);
    }

    onEmptyData(data: any): void {
        this.historyEmpty && (this.historyEmpty.active = true);
        this.btnNext.interactable = false;
        this.btnBack.interactable = false;
        this.updatePageNumber(1);
        this.updatePageTotal(1);
        this.setFramePageState(false);
        this.tableHistory.updateData(data);
    }

    onErrorData(): void {
        this.totalPage = 1;
        this.stopLoading();
    }
}
