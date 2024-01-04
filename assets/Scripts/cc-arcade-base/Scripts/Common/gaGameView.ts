import { gaIState, } from "../StateMachine/gaIStateMachine";
import { gaStateMachine } from "../StateMachine/gaStateMachine";
import gaStateView from "../StateMachine/gaStateView";
import gaComponent from "../Components/gaComponent";
import gaEventsCode from "../Definitions/gaEventsCode";
import gaReferenceManager from "./gaReferenceManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class gaGameView extends gaComponent {

    //#region ------------------------------------------------------------------ Declare variables

    @property([gaStateView]) private stateViews: gaStateView[] = [];

    private _stateMachine: gaStateMachine = null;
    private _initialized: boolean = false;

    //#endregion

    //#region  --------------------------------------------------------------- Component functions

    protected onLoad(): void {
        gaReferenceManager.instance.setReference("gameView", this.node);
        for (let index = 0; index < this.stateViews.length; index++) {
            const element = this.stateViews[index];
            element.node.active = true;
            element.node.removeComponent(cc.Widget);
            element.onScreenSizeChanged();
        }
        super.onLoad();
    }

    protected onDestroy(): void {
        super.onDestroy();
        if (this._stateMachine) {
            this._stateMachine.cleanUp();
        }
    }

    //#endregion

    //#region  ------------------------------------------------------------------ public functions

    public getCurrentView(): gaStateView {
        const state = this.getState();
        for (let index = 0; index < this.stateViews.length; index++) {
            const element = this.stateViews[index];
            if (state == element.stateName) {
                return element;
            }

        }
        return null;
    }

    public getState(): string {
        return this._stateMachine && this._stateMachine.getState();
    }

    //#endregion

    //#region  ----------------------------------------------------------------- private functions

    protected initEvents(): void {
        this.register(gaEventsCode.COMMON.INITIALIZE_GAME, this.initialize);
        this.register(gaEventsCode.COMMON.ON_SCREEN_RESIZE, this.onScreenResize);
    }

    protected initialize() {
        if (!this._initialized) {
            this._initialized = true;

            const stateViews = new Map<string, gaStateView>();
            for (let index = 0; index < this.stateViews.length; index++) {
                const element = this.stateViews[index];
                stateViews.set(element.stateName, element);
            }
            this._stateMachine = this.initStateViews(stateViews);

            stateViews.forEach(state => state.initialize());
            this._stateMachine.startLifeCycle();
        }
        this.onScreenResize();
    }

    protected onScreenResize() {
        for (let index = 0; index < this.stateViews.length; index++) {
            const element = this.stateViews[index];
            element.onScreenSizeChanged();
        }
    }

    protected abstract initStateViews(stateViews: Map<string, gaIState>): gaStateMachine;

    //#endregion

}
