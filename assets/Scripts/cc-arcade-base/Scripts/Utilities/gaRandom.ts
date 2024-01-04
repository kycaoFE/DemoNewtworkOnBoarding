export default class gaRandom {
    private _result: any;
    private _randomSeed: number;
    private _currentIDValue: number;
    private _totalIndex: number;

    constructor(seed: number = Math.floor(Math.random() * 1000000)) {
        this.initRandomSeed(seed);
    }

    initRandomSeed(seed: number) {
        let finalSeedArray = [];
        let seedArray = [];
        let revertSeedArray = [];
        let seedLength = 0;
        const swapIndex = [10, 6, 32, 33, 5, 23, 3, 13, 1, 25, 28, 39, 16, 26, 15, 20, 27, 2, 30, 34, 17, 42, 11, 7, 0, 40, 22, 37, 12, 18, 14, 47, 38, 19, 36, 8, 31, 46, 4, 43, 9, 24, 29, 45, 41, 21, 44, 35];
        this._result = [];
        this._randomSeed = 0;
        this._currentIDValue = 0;
        this._totalIndex = swapIndex.length;

        if (seed == this._randomSeed && this._result.length != 0) {
            return;
        }
        this._randomSeed = seed;
        seedLength = 1;
        let currentValueMultiply = 1;
        while (2 * currentValueMultiply < this._randomSeed) {
            currentValueMultiply *= 2;
            seedLength++;
        }

        seedArray = [];
        revertSeedArray = [];

        let tmpRandomSeed = this._randomSeed;
        for (let index = 0; index < seedLength; index++) {
            let currentValueChecking = Math.pow(2, seedLength - index - 1);
            if (tmpRandomSeed >= currentValueChecking) {
                seedArray[index] = 1;
                revertSeedArray[index] = 0;
                tmpRandomSeed -= currentValueChecking;
            } else {
                seedArray[index] = 0;
                revertSeedArray[index] = 1;
            }
        }

        finalSeedArray = [];
        this._result = [];
        for (let index = 0; index < this._totalIndex; index++) {
            finalSeedArray[index] = (Math.floor(index / seedLength)) % 2 == 0 ? seedArray[index % seedLength] : revertSeedArray[index % seedLength];
        }

        for (let index = 0; index < this._totalIndex; index += 2) {
            let tmp = finalSeedArray[index];
            finalSeedArray[index] = finalSeedArray[index + 1];
            finalSeedArray[index + 1] = tmp;
        }

        let endNumber = 0;
        for (let index = this._totalIndex - 1; index >= this._totalIndex / 2; index--) {
            endNumber += finalSeedArray[index] != 0 ? Math.pow(2, this._totalIndex - index - 1) : 0;
        }

        this._result[0] = endNumber;

        for (let index = 1; index < this._totalIndex; index++) {
            let shiftValue = swapIndex[index] % 10 == 0 ? 1 : swapIndex[index] % 10;
            let tmpLeft = (this._result[index - 1] >>> shiftValue);
            let tmpRight = Math.abs(~(this._result[index - 1] ^ (tmpLeft << shiftValue))) << (this._totalIndex / 2 - shiftValue);
            this._result[index] = ((tmpLeft ^ tmpRight) % 16777216);
        }
    }

    /**
     * Returns a floating-point pseudo-random number between 0 (inclusive) and 1 (exclusive).
     *
     * @return The random number between 0 and 1.
     */
    public random(): number {
        return this.range(0, 1);
    }

    /**
     * Returns a floating-point pseudo-random number between min (inclusive) and max (exclusive).
     *
     * @param min
     * @param max
     * @return The random number.
     */
    public range(min: number, max: number): number {
        if (this._result.length === 0) {
            this._randomSeed = (new Date()).getTime();
        }

        if (this._currentIDValue >= this._totalIndex - 1) {
            let tmpSeed = (this._result[this._currentIDValue] % 16777216);
            this.initRandomSeed(tmpSeed);
        }

        let tmpValue = this._result[this._currentIDValue++];

        return (tmpValue / 16777216) * (max - min) + min;
    }

    /**
     * Returns a pseudo-random integer between min (inclusive) and max (exclusive).
     * @param min
     * @param max
     * @return The random integer.
     */
    public rangeInt(min: number, max: number): number {
        return Math.floor(this.range(min, max));
    }

    /**
     * Returns a pseudo-random boolean.
     * @return true or false.
     */
    public boolean(): boolean {
        return this.rangeInt(0, 100) >= 50;
    }

    /**
     * Returns a pseudo-random element from input array.
     * @param arr
     * @return The random element.
     */
    public getElement<T>(arr: Array<T>): T {
        if (!arr || arr.length == 0) return null;
        const index = this.rangeInt(0, arr.length);
        return arr[index];
    }

    /**
     * Returns a pseudo-random element from input array except param element.
     * @param arr
     * @exceptedElement element
     * @return The random element.
     */
    public getElementExcept<T>(arr: Array<T>, exceptedElement: T): T {
        if (!arr || arr.length == 0) return null;
        const eleIndex = arr.indexOf(exceptedElement);
        if (eleIndex == -1 || arr.length < 2) {
            return this.getElement(arr);
        }
        const index = this.rangeInt(eleIndex + 1, eleIndex + arr.length) % arr.length;
        return arr[index];
    }
}