import { gaBaseHistoryInfo } from "../../../NodePool/gaCustomDataType";
import gaComponent from "../../gaComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class gaHistoryItem extends gaComponent {
    abstract onSpawn(data: gaBaseHistoryInfo, index: number): void;
}
