class gaLogger {
    private _enable: boolean = true;
    public get enable(): boolean {
        return this._enable;
    }
    public set enable(v: boolean) {
        this._enable = v;
        if (this._enable) {
            this.setLoggers(this._currentLogger);
        } else {
            this.setLoggers(null);
        }
    }

    private _currentLogger: any = null;
    setLoggers(loggers: any) {
        if (loggers) {
            this._currentLogger = loggers;
            this.debug = loggers.log || loggers.debug;
            this.warn = loggers.warn;
            this.error = loggers.error;
        } else {
            this.debug = () => { };
            this.warn = () => { };
            this.error = () => { };
        }
    }

    debug: (_message?: any, ..._optionalParams: any[]) => void = null;
    warn: (_message?: any, ..._optionalParams: any[]) => void = null;
    error: (_message?: any, ..._optionalParams: any[]) => void = null;
}

const logger = new gaLogger();
logger.setLoggers(cc);
export default logger;
