/* eslint-disable @typescript-eslint/no-namespace */
const INVALID_BOUNDS_ERR = "Invalid range bounds: ";

export type ComparableDateObject = {
	isBefore(v: ComparableDateObject): boolean;
};
export namespace Range {
	export type Endpoint =
		| Date
		| number
		| string
		| ComparableDateObject
		| { valueOf(): number | string };
	export type Bounds = "()" | "[]" | "[)" | "(]";

	export interface RangeLiteral<T extends Range.Endpoint = Range.Endpoint> {
		lower?: T | null;
		upper?: T | null;
		bounds: Range.Bounds;
	}
}

export function isRange(value: unknown): value is Range<any> {
	return value instanceof Range;
}

export function isNumericRange(value: unknown): value is Range<number> {
	return (
		isRange(value) && isNumberOrNil(value.begin) && isNumberOrNil(value.end)
	);
}

export function isComparableDate(value: any): value is ComparableDateObject {
	return "isBefore" in value;
}

function isInfinity(value: any) {
	return value === null || value === Infinity || value === -Infinity;
}

function isValidBounds(bounds: string): bounds is Range.Bounds {
	switch (bounds) {
		case "()":
		case "[]":
		case "[)":
		case "(]":
			return true;
		default:
			return false;
	}
}

function boundToMathSymbols(bounds: Range.Bounds) {
	const lower = bounds[0] === "(" ? ">" : ">=";
	const upper = bounds[1] === ")" ? "<" : "<=";

	return { lower, upper };
}

const isNumberOrNil = (value: any): value is number | null | undefined =>
	!isNaN(value) || value === null || value === undefined;

export const isRangeLiteral = (v: any): v is Range.RangeLiteral =>
	typeof v === "object" &&
	!Array.isArray(v) &&
	"bounds" in v &&
	typeof v.bounds === "string" &&
	isValidBounds(v.bounds);

export const isNumericRangeLiteral = (
	v: any,
): v is Range.RangeLiteral<number> =>
	isRangeLiteral(v) && isNumberOrNil(v.upper) && isNumberOrNil(v.lower);

// The less-than operator ensures coercion with valueOf.
function compare<T extends Range.Endpoint>(a?: T, b?: T) {
	if (a === undefined || b === undefined) {
		throw new RangeError("Cannot compare empty ranges");
	}

	if (isComparableDate(a) && isComparableDate(b)) {
		return a.isBefore(b) ? -1 : b.isBefore(a) ? 1 : 0;
	}

	return a < b ? -1 : b < a ? 1 : 0;
}
function stringify(value?: Range.Endpoint | null) {
	return isInfinity(value) ? "" : value?.toString() ?? "";
}

/**
 * Create a new range object with the given begin and end endpoints.
 * You can also pass a two character string for bounds. Defaults to` "[]"` for
 * an all inclusive range.
 *
 * You can use any value for endpoints. `Null` is considered infinity for
 * values that don't have a special infinity type like `Number` has `Infinity`.
 *
 * An empty range is one where either of the endpoints is `undefined` (like `new
 * Range`) or a range with two equivalent, but exculsive endpoints
 * (`new Range(5, 5, "[)")`).
 *
 * **Import**:
 * ```javascript
 * const Range = require("strange")
 * ```
 *
 * @example
 * new Range(10, 20) // => {begin: 10, end: 20, bounds: "[]"}
 * new Range(new Date(2000, 5, 18), new Date(2000, 5, 22))
 *
 * @class Range
 * @constructor
 * @param {Object} begin
 * @param {Object} end
 * @param {String} [bounds="[]"]
 */
export class Range<T extends Range.Endpoint> {
	/**
	 * Range's beginning, or left endpoint.
	 */
	public readonly begin?: T | null | undefined;

	/**
	 * Range's end, or right endpoint.
	 */
	public readonly end?: T | null | undefined;

	/**
	 * Range's bounds.
	 *
	 * Bounds signify whether the range includes or excludes that particular
	 * endpoint.
	 *
	 * Pair | Meaning
	 * -----|--------
	 * `()` | open
	 * `[]` | closed
	 * `[)` | left-closed, right-open
	 * `(]` | left-open, right-closed
	 *
	 * @example
	 * new Range(1, 5).bounds // => "[]"
	 * new Range(1, 5, "[)").bounds // => "[)"
	 */
	public readonly bounds: Range.Bounds;

	/**
	 *
	 * @param begin Range's beginning, or left endpoint.
	 * @param end Range's end, or right endpoint.
	 * @param bounds Range's bounds.
	 */
	constructor(begin?: T | null, end?: T | null, bounds: Range.Bounds = "[]") {
		this.begin = begin;
		this.end = end;

		if (!isValidBounds(bounds)) {
			throw new RangeError(INVALID_BOUNDS_ERR + bounds);
		}

		this.bounds = bounds;
	}

	/**
	 * Compares two range's beginnings.
	 * Returns `-1` if `a` begins before `b` begins, `0` if they're equal and `1`
	 * if `a` begins after `b`.
	 *
	 * @example
	 * Range.compareBeginToBegin(new Range(0, 10), new Range(5, 15)) // => -1
	 * Range.compareBeginToBegin(new Range(0, 10), new Range(0, 15)) // => 0
	 * Range.compareBeginToBegin(new Range(0, 10), new Range(0, 15, "()")) // => 1
	 */
	static compareBeginToBegin<U extends Range.Endpoint>(
		a: Range<U>,
		b: Range<U>,
	): -1 | 0 | 1 {
		const aBegin = a.begin === null ? -Infinity : a.begin;
		const bBegin = b.begin === null ? -Infinity : b.begin;

		if (a.bounds[0] === b.bounds[0]) {
			return compare(aBegin, bBegin);
		} else {
			return compare(aBegin, bBegin) || (b.bounds[0] === "(" ? -1 : 1);
		}
	}

	/**
	 * Compares the first range's beginning to the second's end.
	 * Returns `<0` if `a` begins before `b` ends, `0` if one starts where the other
	 * ends and `>1` if `a` begins after `b` ends.
	 *
	 * @example
	 * Range.compareBeginToEnd(new Range(0, 10), new Range(0, 5)) // => -1
	 * Range.compareBeginToEnd(new Range(0, 10), new Range(-10, 0)) // => 0
	 * Range.compareBeginToEnd(new Range(0, 10), new Range(-10, -5)) // => 1
	 */
	static compareBeginToEnd<U extends Range.Endpoint>(
		a: Range<U>,
		b: Range<U>,
	): -1 | 0 | 1 {
		const aBegin = a.begin === null ? -Infinity : a.begin;
		const bEnd = b.end === null ? Infinity : b.end;

		if (a.bounds[0] === "[" && b.bounds[1] === "]") {
			return compare(aBegin, bEnd);
		} else {
			return compare(aBegin, bEnd) || 1;
		}
	}

	/**
	 * Compares two range's endings.
	 * Returns `-1` if `a` ends before `b` ends, `0` if they're equal and `1`
	 * if `a` ends after `b`.
	 *
	 * @example
	 * Range.compareEndToEnd(new Range(0, 10), new Range(5, 15)) // => -1
	 * Range.compareEndToEnd(new Range(0, 10), new Range(5, 10)) // => 0
	 * Range.compareEndToEnd(new Range(0, 10), new Range(5, 10, "()")) // => 1
	 */
	static compareEndToEnd<U extends Range.Endpoint>(
		a: Range<U>,
		b: Range<U>,
	): -1 | 0 | 1 {
		const aEnd = a.end === null ? Infinity : a.end;
		const bEnd = b.end === null ? Infinity : b.end;

		if (a.bounds[1] === b.bounds[1]) {
			return compare(aEnd, bEnd);
		} else {
			return compare(aEnd, bEnd) || (a.bounds[1] === ")" ? -1 : 1);
		}
	}

	static defaultValueParser: (endpoint: string) => Range.Endpoint = (
		v: string,
	) => v;
	/**
	 * Parses a string stringified by
	 * [`Range.prototype.toString`](#Range.prototype.toString).
	 *
	 * To have it also parse the endpoints to something other than a string, pass
	 * a function as the second argument.
	 *
	 * If you pass `Number` as the _parse_ function and the endpoints are
	 * unbounded, they'll be set to `Infinity` for easier computation.
	 *
	 * @example
	 * Range.parse("[42,69]", Number) // => new Range(42, 69)
	 * Range.parse("[15,]", Number) // => new Range(15, Infinity)
	 * Range.parse("(,3.14]", Number) // => new Range(-Infinity, 3.14, "(]")
	 */
	static parse<U extends Range.Endpoint>(
		range: string,
		parse?: ((endpoint: string) => U) | NumberConstructor,
	): Range<U> {
		if (range === "empty") {
			return new Range<U>(undefined, undefined, "()");
		}

		const bounds = range[0] + range[range.length - 1];
		if (!isValidBounds(bounds)) {
			throw new RangeError(INVALID_BOUNDS_ERR + bounds);
		}
		const endpoints = range.slice(1, -1).split(",", 2);
		let begin = endpoints[0]
			? parse
				? parse(endpoints[0])
				: this.defaultValueParser(endpoints[0])
			: null;
		let end = endpoints[1]
			? parse
				? parse(endpoints[1])
				: this.defaultValueParser(endpoints[1])
			: null;

		if (parse === Number && begin === null) {
			begin = -Infinity;
		}

		if (parse === Number && end === null) {
			end = Infinity;
		}
		return new Range(begin, end, bounds) as Range<U>;
	}

	/**
	 * Merges two ranges and returns a range that encompasses both of them.
	 * The ranges don't have to be intersecting.
	 *
	 * @example
	 * Range.union(new Range(0, 5), new Range(5, 10)) // => new Range(0, 10)
	 * Range.union(new Range(0, 10), new Range(5, 15)) // => new Range(0, 15)
	 *
	 * const a = new Range(-5, 0, "()")
	 * const b = new Range(5, 10)
	 * Range.union(a, b) // => new Range(-5, 10, "(]")
	 */
	static union<U extends Range.Endpoint>(a: Range<U>, b: Range<U>): Range<U> {
		const aIsEmpty = a.isEmpty();
		const bIsEmpty = b.isEmpty();

		if (aIsEmpty && bIsEmpty) {
			return new Range();
		} else if (aIsEmpty) {
			return b;
		} else if (bIsEmpty) {
			return a;
		}

		const begin = Range.compareBeginToBegin(a, b) <= 0 ? a : b;
		const end = Range.compareEndToEnd(a, b) <= 0 ? b : a;
		return new Range(begin.begin, end.end, begin.bounds);
	}

	/**
	 * Compares this range's beginning with the given value.
	 * Returns `-1` if this range begins before the given value, `0` if they're
	 * equal and `1` if this range begins after the given value.
	 *
	 * `null` is considered to signify negative infinity for non-numeric range
	 * endpoints.
	 *
	 * @example
	 * new Range(0, 10).compareBegin(5) // => -1
	 * new Range(0, 10).compareBegin(0) // => 0
	 * new Range(5, 10).compareBegin(0) // => 1
	 * new Range(5, 10).compareBegin(null) // => 1
	 */
	compareBegin(begin: T | null): -1 | 0 | 1 {
		const a = this.begin === null ? -Infinity : this.begin;
		const b = begin === null ? -Infinity : begin;
		return compare(a, b) || (this.bounds[0] == "[" ? 0 : 1);
	}

	/**
	 * Compares this range's end with the given value.
	 * Returns `-1` if this range ends before the given value, `0` if they're
	 * equal and `1` if this range ends after the given value.
	 *
	 * `null` is considered to signify positive infinity for non-numeric range
	 * endpoints.
	 *
	 * @example
	 * new Range(0, 10).compareEnd(5) // => -1
	 * new Range(0, 10).compareEnd(10) // => 0
	 * new Range(0, 5).compareEnd(10) // => 1
	 * new Range(0, 5).compareEnd(null) // => -1
	 */
	compareEnd(end: T | null): -1 | 0 | 1 {
		const a = this.end === null ? Infinity : this.end;
		const b = end === null ? Infinity : end;
		return compare(a, b) || (this.bounds[1] == "]" ? 0 : -1);
	}

	/**
	 * Check whether the range is empty.
	 * An empty range is one where either of the endpoints is `undefined`
	 * (like `new Range`) or a range with two equivalent, but exculsive endpoints
	 * (`new Range(5, 5, "[)")`).
	 *
	 * Equivalence is checked by using the `<` operators, so value objects will be
	 * coerced into something comparable by JavaScript. That usually means calling
	 * the object's `valueOf` function.
	 *
	 * @example
	 * new Range().isEmpty() // => true
	 * new Range(5, 5, "[)").isEmpty() // => true
	 * new Range(1, 10).isEmpty() // => false
	 */
	isEmpty() {
		if (this.begin === null || this.end === null) {
			return false;
		}
		if (this.begin === undefined || this.end === undefined) {
			return true;
		}

		return this.bounds != "[]" && compare(this.begin, this.end) === 0;
	}

	/**
	 * Check whether the range is bounded.
	 * A bounded range is one where neither endpoint is `null` or `Infinity`. An
	 * empty range is considered bounded.
	 *
	 * @example
	 * new Range().isBounded() // => true
	 * new Range(5, 5).isBounded() // => true
	 * new Range(null, new Date(2000, 5, 18)).isBounded() // => false
	 * new Range(0, Infinity).isBounded() // => false
	 * new Range(-Infinity, Infinity).isBounded() // => false
	 */
	isBounded(): boolean {
		if (this.isEmpty()) {
			return true;
		}
		return !(isInfinity(this.begin) || isInfinity(this.end));
	}

	lowerIsBounded(): boolean {
		if (this.isEmpty()) {
			return true;
		}
		return !isInfinity(this.begin);
	}

	upperIsBounded(): boolean {
		if (this.isEmpty()) {
			return true;
		}
		return !isInfinity(this.end);
	}

	/**
	 * @alias isBounded
	 */
	isFinite(): boolean {
		return this.isBounded();
	}

	/**
	 * Check whether the range is fully unbounded (infinite on both ends).
	 */
	isFullyUnbounded(): boolean {
		return isInfinity(this.begin) && isInfinity(this.end);
	}

	/**
	 * Check whether the range is unbounded.
	 * An unbounded range is one where either endpoint is `null` or `Infinity`. An
	 * empty range is not considered unbounded.
	 *
	 * @example
	 * new Range().isUnbounded() // => false
	 * new Range(5, 5).isUnbounded() // => false
	 * new Range(null, new Date(2000, 5, 18)).isUnbounded() // => true
	 * new Range(0, Infinity).isUnbounded() // => true
	 * new Range(-Infinity, Infinity).isUnbounded() // => true
	 */
	isUnbounded(): boolean {
		return !this.isBounded();
	}

	/**
	 * @alias isUnbounded
	 */
	isInfinite(): boolean {
		return this.isUnbounded();
	}

	/**
	 * Check if a given value is contained within this range.
	 * Returns `true` or `false`.
	 *
	 * @example
	 * new Range(0, 10).contains(5) // => true
	 * new Range(0, 10).contains(10) // => true
	 * new Range(0, 10, "[)").contains(10) // => false
	 */
	contains(value: T): boolean {
		const a = this.begin;
		const b = this.end;

		return (
			(b === null ||
				b === undefined ||
				(this.bounds[1] === "]"
					? compare(value, b) <= 0
					: compare(value, b) < 0)) &&
			(a === null ||
				a === undefined ||
				(this.bounds[0] === "["
					? compare(a, value) <= 0
					: compare(a, value) < 0))
		);
	}

	/**
	 * Check if this range intersects with another.
	 * Returns `true` or `false`.
	 *
	 * Ranges that have common points intersect. Ranges that are consecutive and
	 * with *inclusive* endpoints are also intersecting. An empty range will never
	 * intersect.
	 *
	 * @example
	 * new Range(0, 10).intersects(new Range(5, 7)) // => true
	 * new Range(0, 10).intersects(new Range(10, 20)) // => true
	 * new Range(0, 10, "[)").intersects(new Range(10, 20)) // => false
	 * new Range(0, 10).intersects(new Range(20, 30)) // => false
	 */
	intersects(other: Range<T>): boolean {
		if (this.isEmpty()) {
			return false;
		}

		if (other.isEmpty()) {
			return false;
		}

		return (
			Range.compareBeginToEnd(this, other) <= 0 &&
			Range.compareBeginToEnd(other, this) <= 0
		);
	}

	/**
	 * Returns an array of the endpoints and bounds.
	 *
	 * Useful with [Egal.js](https://github.com/moll/js-egal) or other libraries
	 * that compare value objects by their `valueOf` output.
	 *
	 * @example
	 * new Range(1, 10, "[)").valueOf() // => [1, 10, "[)"]
	 */
	valueOf(): [T | null | undefined, T | null | undefined, Range.Bounds] {
		return [this.begin, this.end, this.bounds];
	}

	/**
	 * Stringifies a range in `[a,b]` format.
	 *
	 * This happens to match the string format used by [PostgreSQL's range type
	 * format](http://www.postgresql.org/docs/9.4/static/rangetypes.html). You can
	 * therefore use stRange.js to parse and stringify ranges for your database.
	 *
	 * @example
	 * new Range(1, 5).toString() // => "[1,5]"
	 * new Range(1, 10, "[)").toString() // => "[1,10)"
	 */
	toString(): string {
		if (this.isEmpty()) {
			return "empty";
		}

		const a = stringify(this.begin);
		const b = stringify(this.end);
		return this.bounds[0] + a + "," + b + this.bounds[1];
	}

	/**
	 * Stringifies the range when passing it to `JSON.stringify`.
	 * This way you don't need to manually call `toString` when stringifying.
	 *
	 * @example
	 * JSON.stringify(new Range(1, 10)) // "\"[1,10]\""
	 *
	 * @alias toString
	 */
	toJSON(): string {
		return this.toString();
	}

	/**
	 * @alias toJSON
	 */
	inspect(): string {
		return this.toString();
	}

	pgFormatBound(value?: T | null, prepare = (v: T) => v.toString()): string {
		if (value === null || value === undefined || isInfinity(value)) {
			return "";
		}

		return prepare(value);
	}

	public toPostgres(prepare = (v: T) => v.toString()) {
		if (this.isEmpty()) {
			return "empty";
		}

		const pgValue = `${this.bounds[0]}${this.pgFormatBound(
			this.begin,
			prepare,
		)},${this.pgFormatBound(this.end, prepare)}${this.bounds[1]}`;

		return pgValue;
	}

	/**
	 * Converts to format for showing to users, such as <=5,
	 */
	public toDisplay() {
		if (this.isEmpty()) {
			return "empty";
		}

		if (this.isFullyUnbounded()) {
			return "infinite";
		}

		const { lower, upper } = boundToMathSymbols(this.bounds);

		const parts: string[] = [];

		if (this.lowerIsBounded()) {
			parts.push(`${lower}${this.begin!.toString()}`);
		}

		if (this.upperIsBounded()) {
			parts.push(`${upper}${this.end!.toString()}`);
		}

		return parts.join(",");
	}
}

export class BoundedRange<T extends Range.Endpoint> extends Range<T> {
	constructor(
		public begin: T,
		public end: T,
		bounds: Range.Bounds = "[]",
	) {
		super(begin, end, bounds);
	}
}
