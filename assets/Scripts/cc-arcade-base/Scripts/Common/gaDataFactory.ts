import gaResultData from "../Network/Data/gaResultData";
import gaRoundData from "../Network/Data/gaRoundData";
import logger from "../Utilities/gaLogger";

export default class gaDataFactory {
    public static instance: gaDataFactory = null;

    create<T>(type: any, data: any): T {
        switch (type) {
            case gaResultData:
                return new gaResultData(data) as any;
            case gaRoundData:
                return new gaRoundData(data) as any;
        }
        logger.error("Not implemented type of data factory for ", type);
    }

    destroy(): void {
        gaDataFactory.instance = null;
    }
}
