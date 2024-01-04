export interface gaIState {
    isCurrentState: boolean;
    onEnter(...args: any[]): void;
    onLeave(...args: any[]): void;
}

export interface gaITransition {
    fromState: string;
    event: string;
    toState: string;
    callback(...args: any[]): void;
}

export interface gaIStateMachine {
    addTransitions(transitions: gaITransition[]): void;
    getState(): string;
    can(event: string): boolean;
    isFinal(): boolean;
}
