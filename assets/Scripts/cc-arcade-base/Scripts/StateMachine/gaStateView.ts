import gaComponent from "../Components/gaComponent";
import { gaIState } from "./gaIStateMachine";
const { ccclass } = cc._decorator;

@ccclass
export default abstract class gaStateView extends gaComponent implements gaIState {
    public abstract stateName: string;
    isCurrentState: boolean = false;
    public onLoad(): void { }
    public start(): void { }
    public abstract initialize(): void;
    public abstract onEnter(..._args: any[]): void;
    public abstract onLeave(..._args: any[]): void;
    public onScreenSizeChanged(): void { }
}
