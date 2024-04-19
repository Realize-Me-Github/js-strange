<h1 align="center">Js Strange</h1>

<p align="center">Range aka interval object. Supports exclusive and infinite ranges. Comes with an interval tree (augmented binary search tree).</p>

<p align="center">
	<a href="https://github.com/Realize-Me-Github/js-strange/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://github.com/Realize-Me-Github/js-strange/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg"></a>
	<a href="http://npmjs.com/package/js-strange"><img alt="📦 npm version" src="https://img.shields.io/npm/v/js-strange?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
	
</p>
### Installing on Node.js
```
npm install strange
```

### Installing for the browser

stRange.js doesn't yet have a build ready for the browser, but you might be able
to use [Browserify][browserify] to have it run there till then.

[browserify]: https://github.com/substack/node-browserify

## Using

Create a Range object by passing in a beginning and end:

```javascript
var Range = require("strange");
var range = new Range(1, 5);
```

Check if something is a range and use it:

```javascript
var Range = require("strange");

if (range instanceof Range) {
	console.log(range.begin, range.end);
}
```

### Bounds

You can set a range's bounds by passing the bounds as a two-character string of
parentheses as the 3rd argument:

```javascript
new Range(1, 3, "[)");
```

Bounds signify whether the range includes or excludes that particular endpoint.
The range above therefore includes numbers `>= 1 < 3`.

| Pair | Meaning                 |
| ---- | ----------------------- |
| `()` | open                    |
| `[]` | closed                  |
| `[)` | left-closed, right-open |
| `(]` | left-open, right-closed |

### Parsing

To parse a range stringified by `Range.prototype.toString`, pass it to
`Range.parse`:

```javascript
Range.parse("[a,z)"); // => new Range("a", "z", "[)")
```

To have stRange.js also parse the endpoints, pass a function to `Range.parse`:

```javascript
Range.parse("[42,69]", Number); // => new Range(42, 69)
```

### Using with PostgreSQL

The string format used by stRange.js matches [PostgreSQL's range type
format](http://www.postgresql.org/docs/9.4/static/rangetypes.html). You can
therefore use stRange.js to parse and stringify ranges for your database.

## API

For extended documentation on all functions, please see the
[stRange.js API Documentation][api].

[api]: https://github.com/moll/js-strange/blob/master/doc/API.md

### [Range](https://github.com/moll/js-strange/blob/master/doc/API.md#Range)

- [begin](https://github.com/moll/js-strange/blob/master/doc/API.md#range.begin)
- [bounds](https://github.com/moll/js-strange/blob/master/doc/API.md#range.bounds)
- [end](https://github.com/moll/js-strange/blob/master/doc/API.md#range.end)
- [.prototype.compareBegin](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.compareBegin)(begin)
- [.prototype.compareEnd](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.compareEnd)(end)
- [.prototype.contains](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.contains)(value)
- [.prototype.intersects](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.intersects)(other)
- [.prototype.isBounded](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.isBounded)()
- [.prototype.isEmpty](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.isEmpty)()
- [.prototype.isFinite](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.isFinite)()
- [.prototype.isInfinite](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.isInfinite)()
- [.prototype.isUnbounded](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.isUnbounded)()
- [.prototype.toJSON](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.toJSON)()
- [.prototype.toString](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.toString)()
- [.prototype.valueOf](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.prototype.valueOf)()
- [.compareBeginToBegin](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.compareBeginToBegin)(a, b)
- [.compareBeginToEnd](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.compareBeginToEnd)(a, b)
- [.compareEndToEnd](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.compareEndToEnd)(a, b)
- [.parse](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.parse)(range, [parseEndpoint])
- [.union](https://github.com/moll/js-strange/blob/master/doc/API.md#Range.union)(union, a, b)

### [RangeTree](https://github.com/moll/js-strange/blob/master/doc/API.md#RangeTree)

- [.prototype.search](https://github.com/moll/js-strange/blob/master/doc/API.md#RangeTree.prototype.search)(valueOrRange)
- [.from](https://github.com/moll/js-strange/blob/master/doc/API.md#RangeTree.from)(ranges)

## License

stRange.js is released under a _Lesser GNU Affero General Public License_, which in summary means:

- You **can** use this program for **no cost**.
- You **can** use this program for **both personal and commercial reasons**.
- You **do not have to share your own program's code** which uses this program.
- You **have to share modifications** (e.g bug-fixes) you've made to this program.

For more convoluted language, see the `LICENSE` file.

## About

**[Andri Möll](http://themoll.com)** typed this and the code.  
[Monday Calendar](https://mondayapp.com) supported the engineering work.

If you find stRange.js needs improving, please don't hesitate to type to me now at [andri@dot.ee](mailto:andri@dot.ee) or [create an issue online](https://github.com/moll/js-strange/issues).

<!-- You can remove this notice if you don't want it 🙂 no worries! -->

> 💙 This package was templated with [`js-strange`](https://github.com/JoshuaKGoldberg/js-strange).
