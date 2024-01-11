class CancelablePromiseInternal<T = any> {
    private _internals: Internals;
    private _promise: Promise<T>;

    constructor ({
        executor = () => { },
        internals = defaultInternals(),
        promise = new Promise<T>((resolve, reject) =>
            executor(resolve, reject, (onCancel) => {
                internals.onCancelList.push(onCancel);
            })
        ),
    }: {
        executor?: (
            resolve: (value: T | PromiseLike<T>) => void,
            reject: (reason?: any) => void,
            onCancel: (cancelHandler: () => void) => void
        ) => void;
        internals?: Internals;
        promise?: Promise<T>;
    }) {
        this.cancel = this.cancel.bind(this);
        this._internals = internals;
        this._promise =
            promise ||
            new Promise<T>((resolve, reject) =>
                executor(resolve, reject, (onCancel) => {
                    internals.onCancelList.push(onCancel);
                })
            );
    }

    delay(seconds: number): gaPromise<void> {
        const waiter = () => {
            return new gaPromise<void>((resolve) => {
                clearTimeout(this._internals.timeout);
                this._internals.timeout = setTimeout(() => {
                    resolve();
                }, seconds * 1000);
            })
        }
        return makeCancelable(
            this._promise.then(
                createCallback(waiter, this._internals)
            ),
            this._internals
        );
    }

    waitUntil(conditionFn: () => boolean): gaPromise<void> {
        const waiter = () => {
            return new gaPromise<void>((resolve) => {
                const waitFn = () => {
                    this._internals.timeout = setTimeout(() => {
                        if (conditionFn() === true) {
                            resolve();
                        } else {
                            waitFn();
                        }
                    }, 10);
                }
                clearTimeout(this._internals.timeout);
                waitFn();
            })
        }
        return makeCancelable(
            this._promise.then(
                createCallback(waiter, this._internals)
            ),
            this._internals
        );
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?:
            | ((
                value: T
            ) => TResult1 | PromiseLike<TResult1> | gaPromise<TResult1>)
            | undefined
            | null,
        onrejected?:
            | ((
                reason: any
            ) => TResult2 | PromiseLike<TResult2> | gaPromise<TResult2>)
            | undefined
            | null
    ): gaPromise<TResult1 | TResult2> {
        return makeCancelable<TResult1 | TResult2>(
            this._promise.then(
                createCallback(onfulfilled, this._internals),
                createCallback(onrejected, this._internals)
            ),
            this._internals
        );
    }

    catch<TResult = never>(
        onrejected?:
            | ((
                reason: any
            ) => TResult | PromiseLike<TResult> | gaPromise<TResult>)
            | undefined
            | null
    ): gaPromise<T | TResult> {
        return makeCancelable<T | TResult>(
            this._promise.catch(createCallback(onrejected, this._internals)),
            this._internals
        );
    }

    finally(
        onfinally?: (() => void) | undefined | null,
        runWhenCanceled?: boolean
    ): gaPromise<T> {
        if (runWhenCanceled) {
            this._internals.onCancelList.push(onfinally);
        }
        return makeCancelable<T>(
            this._promise['finally'](
                createCallback(() => {
                    if (onfinally) {
                        if (runWhenCanceled) {
                            this._internals.onCancelList =
                                this._internals.onCancelList.filter(
                                    (callback) => callback !== onfinally
                                );
                        }
                        return onfinally();
                    }
                }, this._internals)
            ),
            this._internals
        );
    }

    cancel(): void {
        clearTimeout(this._internals.timeout);
        this._internals.timeout = null;
        this._internals.isCanceled = true;
        const callbacks = this._internals.onCancelList;
        this._internals.onCancelList = [];
        for (const callback of callbacks) {
            if (typeof callback === 'function') {
                try {
                    callback();
                } catch (err) {
                    cc.error(err);
                }
            }
        }
    }

    isCanceled(): boolean {
        return this._internals.isCanceled === true;
    }
}

export class gaPromise<T = any> extends CancelablePromiseInternal<T> {
    static all = function all(iterable: any) {
        return makeAllCancelable(iterable, Promise.all(iterable));
    } as CancelablePromiseOverloads['all'];

    static resolve = function resolve(value) {
        return cancelable(Promise.resolve(value));
    } as CancelablePromiseOverloads['resolve'];

    static reject = function reject(reason) {
        return cancelable(Promise.reject(reason));
    } as CancelablePromiseOverloads['reject'];

    static isCancelable = isCancelablePromise;

    constructor (
        executor: (
            resolve: (value: T | PromiseLike<T>) => void,
            reject: (reason?: any) => void,
            onCancel: (cancelHandler: () => void) => void
        ) => void
    ) {
        super({ executor });
    }
}

export default gaPromise;

function cancelable<T = any>(promise: Promise<T>): gaPromise<T> {
    return makeCancelable(promise, defaultInternals());
}

function isCancelablePromise(promise: any): boolean {
    return (
        promise instanceof gaPromise ||
        promise instanceof CancelablePromiseInternal
    );
}

function createCallback(onResult: any, internals: Internals) {
    if (onResult) {
        return (arg?: any) => {
            if (!internals.isCanceled) {
                const result = onResult(arg);
                if (isCancelablePromise(result)) {
                    internals.onCancelList.push(result.cancel);
                }
                return result;
            }
            return arg;
        };
    }
}

function makeCancelable<T>(promise: Promise<T>, internals: Internals) {
    return new CancelablePromiseInternal<T>({
        internals,
        promise,
    }) as gaPromise<T>;
}

function makeAllCancelable(iterable: any, promise: Promise<any>) {
    const internals = defaultInternals();
    internals.onCancelList.push(() => {
        for (const resolvable of iterable) {
            if (isCancelablePromise(resolvable)) {
                resolvable.cancel();
            }
        }
    });
    return new CancelablePromiseInternal({ internals, promise });
}

function defaultInternals(): Internals {
    return { isCanceled: false, onCancelList: [], timeout: null };
}

interface Internals {
    isCanceled: boolean;
    timeout: any;
    onCancelList: any[];
}

interface CancelablePromiseOverloads {
    all<T extends unknown[]>(
        values: T
    ): gaPromise<{ [P in keyof T]: Awaited<T[P]> }>;

    resolve(): gaPromise<void>;

    resolve<T>(
        value: T | PromiseLike<T> | gaPromise<T>
    ): gaPromise<T>;

    reject<T = never>(reason?: any): gaPromise<T>;
}
