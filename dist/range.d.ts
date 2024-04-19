export type ComparableDateObject = {
    isBefore(v: ComparableDateObject): boolean;
};
export declare namespace Range {
    type Endpoint = Date | number | string | ComparableDateObject | {
        valueOf(): number | string;
    };
    type Bounds = "()" | "[]" | "[)" | "(]";
    interface RangeLiteral<T extends Range.Endpoint = Range.Endpoint> {
        lower?: T | null;
        upper?: T | null;
        bounds: Range.Bounds;
    }
}
export declare function isRange(value: unknown): value is Range<any>;
export declare function isNumericRange(value: unknown): value is Range<number>;
export declare function isComparableDate(value: any): value is ComparableDateObject;
export declare const isRangeLiteral: (v: any) => v is Range.RangeLiteral<Range.Endpoint>;
export declare const isNumericRangeLiteral: (v: any) => v is Range.RangeLiteral<number>;
export declare class Range<T extends Range.Endpoint> {
    readonly begin?: T | null | undefined;
    readonly end?: T | null | undefined;
    readonly bounds: Range.Bounds;
    constructor(begin?: T | null, end?: T | null, bounds?: Range.Bounds);
    static compareBeginToBegin<U extends Range.Endpoint>(a: Range<U>, b: Range<U>): -1 | 0 | 1;
    static compareBeginToEnd<U extends Range.Endpoint>(a: Range<U>, b: Range<U>): -1 | 0 | 1;
    static compareEndToEnd<U extends Range.Endpoint>(a: Range<U>, b: Range<U>): -1 | 0 | 1;
    static defaultValueParser: (endpoint: string) => Range.Endpoint;
    static parse<U extends Range.Endpoint>(range: string, parse?: ((endpoint: string) => U) | NumberConstructor): Range<U>;
    static union<U extends Range.Endpoint>(a: Range<U>, b: Range<U>): Range<U>;
    compareBegin(begin: T | null): -1 | 0 | 1;
    compareEnd(end: T | null): -1 | 0 | 1;
    isEmpty(): boolean;
    isBounded(): boolean;
    lowerIsBounded(): boolean;
    upperIsBounded(): boolean;
    isFinite(): boolean;
    isFullyUnbounded(): boolean;
    isUnbounded(): boolean;
    isInfinite(): boolean;
    contains(value: T): boolean;
    intersects(other: Range<T>): boolean;
    valueOf(): [T | null | undefined, T | null | undefined, Range.Bounds];
    toString(): string;
    toJSON(): string;
    inspect(): string;
    pgFormatBound(value?: T | null, prepare?: (v: T) => string): string;
    toPostgres(prepare?: (v: T) => string): string;
    toDisplay(): string;
}
export declare class BoundedRange<T extends Range.Endpoint> extends Range<T> {
    begin: T;
    end: T;
    constructor(begin: T, end: T, bounds?: Range.Bounds);
}
