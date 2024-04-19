import { Range } from "./range";

function dedupe<T extends Range.Endpoint>(
	ranges: Range<T>[][],
	range: Range<T>[],
) {
	const last = ranges[ranges.length - 1];

	if (last && Range.compareBeginToBegin(last[0], range[0]) === 0) {
		last.push(range[0]);
	} else {
		ranges.push(range);
	}

	return ranges;
}

function arrayify<T = any>(obj: T): T[] {
	return [obj];
}

function isNotEmpty(range: Range<any>) {
	return !range.isEmpty();
}

function reverseCompareEndToEnd(a: Range<any>, b: Range<any>) {
	return Range.compareEndToEnd(a, b) * -1;
}

/**
 * Create an interval tree node.
 *
 * For creating a binary search tree out of an array of ranges, you might want
 * to use [`RangeTree.from`](#RangeTree.from).
 *
 * @example
 * var RangeTree = require("strange/tree")
 * var left = new RangeTree([new Range(-5, 0)])
 * var right = new RangeTree([new Range(5, 10)])
 * var root = new RangeTree([new Range(0, 5), new Range(0, 10)], left, right)
 * root.search(7) // => [new Range(0, 10), new Range(5, 10)]
 */
export class RangeTree<T extends Range.Endpoint> {
	/**
	 * Create an interval tree (implemented as an augmented binary search tree)
	 * from an array of ranges.
	 * Returns a [`RangeTree`](#RangeTree) you can search on.
	 *
	 * If you need to relate the found ranges to other data, add some properties
	 * directly to every range _or_ use JavaScript's `Map` or `WeakMap` to relate
	 * extra data to those range instances.
	 *
	 * @example
	 * var ranges = [new Range(0, 10), new Range(20, 30), new Range(40, 50)]
	 * RangeTree.from(ranges).search(42) // => [new Range(40, 50)]
	 */
	static from<U extends Range.Endpoint>(ranges: Array<Range<U>>): RangeTree<U> {
		const deduped = ranges
			.filter(isNotEmpty)
			.sort(Range.compareBeginToBegin)
			.map(arrayify)
			.reduce<Range<U>[][]>(dedupe, []);
		return RangeTree.new(deduped);
	}

	/**
	 * Ranges of current tree node.
	 */
	private keys: Array<Range<T>>;
	private left: RangeTree<T> | null;
	private right: RangeTree<T> | null;
	private range: Range<T>;

	constructor(
		keys: Range<T> | Array<Range<T>>,
		left?: RangeTree<T> | null,
		right?: RangeTree<T> | null,
	) {
		// Store the longest range first.

		// Store the longest range first.
		if (Array.isArray(keys)) {
			this.keys = keys.slice().sort(reverseCompareEndToEnd);
		} else {
			this.keys = [keys];
		}

		this.left = left || null;
		this.right = right || null;

		// Remember, the topmost key has the longest range.
		const a = this.left ? this.left.range : this.keys[0];
		const b = this.right
			? Range.union<T>(this.keys[0], this.right.range)
			: this.keys[0];
		this.range = Range.union(a, b);
	}

	static new<T extends Range.Endpoint>(ranges: Range<T>[][]): RangeTree<T> {
		switch (ranges.length) {
			case 0:
				return new RangeTree(new Range());
			case 1:
				return new RangeTree(ranges[0]);
			case 2:
				return new RangeTree(ranges[0], null, new RangeTree(ranges[1]));

			default: {
				const middle = Math.floor(ranges.length / 2);
				const left = RangeTree.new(ranges.slice(0, middle));
				const right = RangeTree.new(ranges.slice(middle + 1));
				return new RangeTree(ranges[middle], left, right);
			}
		}
	}

	/**
	 * Search for ranges that include the given value or, given a range, intersect
	 * with it.
	 * Returns an array of matches or an empty one if no range contained or
	 * intersected with the given value.
	 *
	 * @example
	 * var tree = RangeTree.from([new Range(40, 50)])
	 * tree.search(42) // => [new Range(40, 50)]
	 * tree.search(13) // => []
	 * tree.search(new Range(30, 42)) // => [new Range(40, 50)]
	 */
	search(valueOrRange: T | Range<T>): Array<Range<T>> {
		if (valueOrRange instanceof Range) {
			return this.searchByRange(valueOrRange);
		} else {
			return this.searchByValue(valueOrRange);
		}
	}

	searchByValue(value: T): Range<T>[] {
		if (!this.range.contains(value)) {
			return [];
		}

		const ownPosition = this.keys[0].compareBegin(value);

		return [
			this.left ? this.left.searchByValue(value) : [],
			ownPosition <= 0 ? this.searchOwnByValue(value) : [],
			this.right && ownPosition < 0 ? this.right.searchByValue(value) : [],
		].flat();
	}

	searchByRange(range: Range<T>): Range<T>[] {
		if (!this.range.intersects(range)) {
			return [];
		}

		const ownPosition = Range.compareBeginToEnd(this.keys[0], range);

		return [
			this.left ? this.left.searchByRange(range) : [],
			ownPosition <= 0 ? this.searchOwnByRange(range) : [],
			this.right && ownPosition < 0 ? this.right.searchByRange(range) : [],
		].flat();
	}

	// Sort ranges in ascending order for beauty. O:)
	searchOwnByValue(value: T) {
		return this.keys
			.filter(function (r) {
				return r.contains(value);
			})
			.reverse();
	}

	searchOwnByRange(range: Range<T>) {
		return this.keys
			.filter(function (r) {
				return r.intersects(range);
			})
			.reverse();
	}
}
