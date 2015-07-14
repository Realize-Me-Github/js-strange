module.exports = Range

/**
 * Create a new range object with the given begin and end endpoints.  
 * You can also pass a two character string for bounds. Defaults to` "[]"` for
 * an all inclusive range.
 *
 * You can use any value for endpoints. `Null` is considered infinity for
 * values that don't have a special infinity type like `Number` has `Infinity`.
 *
 * @example
 * new Range(10, 20) // => {begin: 10, end: 20, bounds: "[]"}
 * new Range(new Date(2000, 5, 18), new Date(2000, 5, 22)
 *
 * @class Range
 * @constructor
 * @param begin
 * @param end
 * @param [bounds]
 */
function Range(begin, end, bounds) {
  if (!(this instanceof Range)) return new Range(begin, end, bounds)

  /**
   * Range's beginning, or left endpoint.
   *
   * @property begin
   */
  this.begin = begin

  /**
   * Range's end, or right endpoint.
   *
   * @property end
   */
  this.end = end

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
   *
   * @property {String} bounds
   */
   this.bounds = bounds === undefined ? "[]" : bounds
}

/**
 * Check whether the range is empty.  
 * An empty range is one with `undefined` endpoints (like `new Range`) or
 * a range with two equivalent, but exculsive endpoints (`new Range(5, 5,
 * "[)")`).
 *
 * Equivalence is checked by using the `<` operators, so value objects will be
 * coerced into something comparable by JavaScript. That usually means calling
 * the object's `valueOf` function.
 *
 * @example
 * new Range().isEmpty() // => true
 * new Range(5, 5, "[)").isEmpty() // => true
 * new Range(1, 10).isEmpty() // => false
 *
 * @method isEmpty
 */
Range.prototype.isEmpty = function() {
  if (this.begin === undefined || this.end === undefined) return true
  return this.bounds != "[]" && compare(this.begin, this.end) === 0
}

/**
 * Check whether the range is bounded.  
 * A bounded range is one where neither endpoint is `null` or `Infinity`. An
 * empty range is considered bounded.
 *
 * @example
 * new Range().isBounded() // => true
 * new Range(5, 5).isBounded() // => true
 * new Range(null, new Date(2000, 5, 18).isBounded() // => false
 * new Range(0, Infinity).isBounded() // => false
 * new Range(-Infinity, Infinity).isBounded() // => false
 *
 * @method isBounded
 */
Range.prototype.isBounded = function() {
  if (this.begin === undefined || this.end === undefined) return true
  return !(isInfinity(this.begin) || isInfinity(this.end))
}

/**
 * @method isFinite
 * @alias isBounded
 */
Range.prototype.isFinite = Range.prototype.isBounded

/**
 * Check whether the range is unbounded.  
 * An unbounded range is one where either endpoint is `null` or `Infinity`. An
 * empty range is not considered unbounded.
 *
 * @example
 * new Range().isUnbounded() // => false
 * new Range(5, 5).isUnbounded() // => false
 * new Range(null, new Date(2000, 5, 18).isUnbounded() // => true
 * new Range(0, Infinity).isUnbounded() // => true
 * new Range(-Infinity, Infinity).isUnbounded() // => true
 *
 * @method isUnbounded
 */
Range.prototype.isUnbounded = function() {
  return !this.isBounded()
}

/**
 * @method isInfinite
 * @alias isUnbounded
 */
Range.prototype.isInfinite = Range.prototype.isUnbounded

/**
 * Check if a given value is contained within this range.  
 * Returns `true` or `false`.
 *
 * @example
 * new Range(0, 10).contains(5) // => true
 * new Range(0, 10).contains(10) // => true
 * new Range(0, 10, "[)").contains(10) // => false
 *
 * @method contains
 * @param value
 */
Range.prototype.contains = function(value) {
  var a = this.begin
  var b = this.end

  return (
    (b === null || (this.bounds[1] === "]" ? value <= b : value < b)) &&
    (a === null || (this.bounds[0] === "[" ? a <= value : a < value))
  )
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
 *
 * @method intersects
 * @param other
 */
Range.prototype.intersects = function(other) {
  if (this.isEmpty()) return false
  if (other.isEmpty()) return false
  return isBeginBeforeEnd(this, other) && isBeginBeforeEnd(other, this)
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
 *
 * @method toString
 */
Range.prototype.toString = function() {
  // FIXME: How to serialize an empty range with undefined endpoints?
  var a = stringify(this.begin)
  var b = stringify(this.end)
  return this.bounds[0] + a + "," + b + this.bounds[1]
}

/**
 * Stringifies the range when passing it to `JSON.stringify`.  
 * This way you don't need to manually call `toString` when stringifying.
 *
 * @example
 * JSON.stringify(new Range(1, 10)) // "\"[1,10]\""
 *
 * @method toJSON
 * @alias toString
 */
Range.prototype.toJSON = Range.prototype.toString
Range.prototype.inspect = Range.prototype.toString

/**
 * Compares two range's beginnings.  
 * Returns `-1` if `a` begins before `b` begins, `0` if they're equal and `1`
 * if `a` begins after `b`.
 *
 * @example
 * Range.compareBeginToBegin(new Range(0, 10), new Range(5, 15)) // => -1
 * Range.compareBeginToBegin(new Range(0, 10), new Range(0, 15)) // => 0
 * Range.compareBeginToBegin(new Range(0, 10), new Range(0, 15, "()")) // => -1
 *
 * @static
 * @method compareBeginToBegin
 * @param {Object} a
 * @param {Object} b
 */
Range.compareBeginToBegin = function(a, b) {
  if (a.bounds[0] === b.bounds[0]) return compare(a.begin, b.begin)
  else return compare(a.begin, b.begin) || (b.bounds[0] === "(" ? -1 : 1)
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
 *
 * @static
 * @method compareEndToEnd
 * @param {Object} a
 * @param {Object} b
 */
Range.compareEndToEnd = function(a, b) {
  if (a.bounds[1] === b.bounds[1]) return compare(a.end, b.end)
  else return compare(a.end, b.end) || (a.bounds[1] === ")" ? -1 : 1)
}

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
 * Range.parse("[a,z)") // => new Range("a", "z", "[)")
 * Range.parse("[42,69]", Number) // => new Range(42, 69)
 * Range.parse("[15,]", Number) // => new Range(15, Infinity)
 * Range.parse("(,3.14]", Number) // => new Range(-Infinity, 3.14, "(]")
 *
 * @static
 * @method parse
 * @param {String} range
 * @param {Function} [parseEndpoint]
 */
Range.parse = function(range, parse) {
  var endpoints = range.slice(1, -1).split(",", 2)
  var begin = endpoints[0] ? parse ? parse(endpoints[0]) : endpoints[0] : null
  var end = endpoints[1] ? parse ? parse(endpoints[1]) : endpoints[1] : null
  if (parse === Number && begin === null) begin = -Infinity
  if (parse === Number && end === null) end = Infinity
  return new Range(begin, end, range[0] + range[range.length - 1])
}

function stringify(value) { return isInfinity(value) ? "" : String(value) }

function isInfinity(value) {
  return value === null || value === Infinity || value === -Infinity
}

function compare(a, b) {
  if (a === null && b === null) return 0
  if (a === null && b !== null) return -1
  if (a !== null && b === null) return 1
  // The less-than operator ensures coercion with valueOf.
  return a < b ? -1 : b < a ? 1 : 0
}

function isBeginBeforeEnd(a, b) {
  if (a.bounds[0] === "[" && b.bounds[1] === "]") return a.begin <= b.end
  else return a.begin < b.end
}
