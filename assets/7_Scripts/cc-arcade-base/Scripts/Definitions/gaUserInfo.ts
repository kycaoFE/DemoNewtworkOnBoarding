
import { network } from '../Definitions/gaCommon';
import gaEventEmitter from '../Common/gaEventEmitter';
import gaEventsCode from './gaEventsCode';
const { PlayerInfoStateManager } = network;
const playerInfoStateManager = PlayerInfoStateManager.getInstance();

export default class gaUserInfo {
    get displayName(): string {
        return playerInfoStateManager && playerInfoStateManager.getDisplayName();
    }

    get availableAmount(): number {
        return this.totalAmount - this._pending;
    }

    get totalAmount(): number {
        return playerInfoStateManager && playerInfoStateManager.getWallets().amount;
    }

    get userId(): string {
        return playerInfoStateManager && playerInfoStateManager.getUserId();
    }

    private _pending = 0;
	public avatar = "";

    public setPending(amount: number) {
        amount = Math.max(0, amount);
        const changed = amount != this._pending;
        if (changed) {
            this._pending = Math.max(0, amount);
        }
    }

    public clearPending(): void {
        this.setPending(0);
        gaEventEmitter.instance.emit(gaEventsCode.USER.UPDATE_BALANCE, this.availableAmount);
    }
}
