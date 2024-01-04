import { gaIState, gaIStateMachine, gaITransition } from "./gaIStateMachine";
import gaEventEmitter from '../Common/gaEventEmitter';
import logger from "../Utilities/gaLogger";

export function Transition(fromState: string, event: string, toState: string, callback: () => void = null): gaITransition {
    return { fromState, event, toState, callback };
}

export class gaStateMachine implements gaIStateMachine {
    protected currentState: string;
    protected currentView: gaIState;
    private _initState: string = null;
    private _listenedEvents: string[] = [];
    private _isRunning: boolean = false;

    constructor (initState: string, protected transitions: gaITransition[] = [], protected stateViews: Map<string, gaIState>) {
        this._initState = initState;
    }

    public startLifeCycle(): void {
        if (!this._isRunning) {
            this._isRunning = true;
            this.currentState = this._initState;
            this.currentView = this.stateViews.get(this._initState);
            this._listenedEvents = [];
            this.transitions.forEach(element => {
                if (this._listenedEvents.indexOf(element.event) == -1) {
                    this._listenedEvents.push(element.event);
                    gaEventEmitter.instance.registerEvent(element.event, (...args: any) => {
                        this._onEvent(element.event, ...args)
                    }, this);
                }
            });
            this.currentView.isCurrentState = true;
            this.currentView.onEnter();
        }
    }

    public addTransitions(transitions: gaITransition[]): void {
        transitions.forEach((tran) => this.transitions.push(tran));
        transitions.forEach(element => {
            if (this._listenedEvents.indexOf(element.event) == -1) {
                this._listenedEvents.push(element.event);
                gaEventEmitter.instance.registerEvent(element.event, (args: any[]) => {
                    this._onEvent(element.event, ...args)
                }, this);
            }
        });
    }

    public getState(): string {
        return this.currentState;
    }

    public can(event: string): boolean {
        return this.transitions.some((trans) => (trans.fromState === this.currentState && trans.event === event));
    }

    public isFinal(): boolean {
        return this.transitions.every((trans) => (trans.fromState !== this.currentState));
    }

    public cleanUp(): void {
        this._listenedEvents = [];
        if (gaEventEmitter.instance) {
            gaEventEmitter.instance.removeEvents(this);
        }
        this.stateViews.forEach((view: any) => {
            if (view && view.isValid && typeof view.destroy == 'function') {
                view.destroy();
            }
        });
        this.currentView = null;
    }

    private _onEvent(event: string, ...args: any[]): void {
        const transitionObj = this.transitions.find(tran =>
            (tran.fromState === this.currentState || tran.fromState as any === "*") && tran.event === event);
        if (transitionObj) {
            const oldStateView = this.currentView;
            const oldState = this.currentState;
            this.currentState = transitionObj.toState;
            this.currentView = this.stateViews.get(this.currentState);
            oldStateView.isCurrentState = false;
            oldStateView.onLeave(...args);
            this.currentView.isCurrentState = true;
            this.currentView.onEnter(...args);
            if (typeof transitionObj.callback == 'function') {
                transitionObj.callback(...args);
            }
            logger.warn(`Transition: from ${oldState} to ${this.currentState}, event ${event}, data = `, args);
        } else {
            logger.error(`Invalid transition ${event} from ${this.currentState}`, args);
        }
    }
}
