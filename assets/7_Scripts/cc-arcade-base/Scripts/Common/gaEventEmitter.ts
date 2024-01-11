import logger from '../Utilities/gaLogger';
export default class gaEventEmitter {
    private _node: cc.Node;

    public static instance: gaEventEmitter = null;

    constructor () {
        this._createNode();
    }

    private _createNode() {
        if (cc.isValid(this._node)) {
            this._node.destroy();
        }
        this._node = new cc.Node('gaEventEmitter');
        this._node.setParent(cc.director.getScene() as any);
        cc.game.addPersistRootNode(this._node);
    }

    emit(event: string, ...args: any[]) {
        if (!cc.isValid(this._node)) return;
        if (args && args.length > 0) {
            logger.debug(`[gaEventEmitter] emit ${event}, data =`, args);
        } else {
            logger.debug(`[gaEventEmitter] emit ${event}`);
        }
        this._node.emit.apply(this._node, arguments);
    }

    registerEvent(_eventCode: string, _listener: Function, _target?: any) {
        if (cc.isValid(this._node)) {
            this._node.on.apply(this._node, arguments);
        }
    }

    registerOnce(_eventCode: string, _listener: Function, _target?: any) {
        if (cc.isValid(this._node)) {
            this._node.once.apply(this._node, arguments);
        }
    }

    removeEvent(_eventCode: string, _listener?: Function, _target?: any) {
        if (cc.isValid(this._node)) {
            this._node.off.apply(this._node, arguments);
        }
    }

    removeEvents(_target: any) {
        if (cc.isValid(this._node)) {
            this._node.targetOff.apply(this._node, arguments);
        }
    }

    removeOnce(_eventCode: string, _listener?: Function, _target?: any) {
        if (cc.isValid(this._node)) {
            this._node.off.apply(this._node, arguments);
        }
    }

    destroy() {
        if (cc.isValid(this._node)) {
            this._node.destroy();
        }
        this._node = null;
        gaEventEmitter.instance = null;
    }
}
