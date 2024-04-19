import { Range } from "./range";
export declare class RangeTree<T extends Range.Endpoint> {
    static from<U extends Range.Endpoint>(ranges: Array<Range<U>>): RangeTree<U>;
    private keys;
    private left;
    private right;
    private range;
    constructor(keys: Range<T> | Array<Range<T>>, left?: RangeTree<T> | null, right?: RangeTree<T> | null);
    static new<T extends Range.Endpoint>(ranges: Range<T>[][]): RangeTree<T>;
    search(valueOrRange: T | Range<T>): Array<Range<T>>;
    searchByValue(value: T): Range<T>[];
    searchByRange(range: Range<T>): Range<T>[];
    searchOwnByValue(value: T): Range<T>[];
    searchOwnByRange(range: Range<T>): Range<T>[];
}
