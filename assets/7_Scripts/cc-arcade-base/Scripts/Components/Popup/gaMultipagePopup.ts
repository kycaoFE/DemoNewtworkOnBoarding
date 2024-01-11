import gaBasePopup from "./gaBasePopup";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract default class gaMultipagePopups extends gaBasePopup {

    @property(cc.Node)
    framePage: cc.Node = null;

    @property(cc.Label)
    pageNumberLabel: cc.Label = null;

    @property(cc.Label)
    pageTotalLabel: cc.Label = null;

    totalPage: number = 0;

    currentPage: number = 0;

    showPage(page: number): void {
    }

    nextPage(): void {
        this.soundPlayer.playSFXClick();
    }

    prevPage(): void {
        this.soundPlayer.playSFXClick();
    }

    updatePageNumber(number: number) {
        this.currentPage = number;
        if (this.pageNumberLabel) {
            this.pageNumberLabel.string = number.toString();
        }
    }

    updatePageTotal(total: number) {
        this.totalPage = total;
        if (this.pageTotalLabel) {
            this.pageTotalLabel.string = total.toString();
        }
    }

    setFramePageState(state: boolean): void {
        this.framePage && (this.framePage.active = state);
    }

}
