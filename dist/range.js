"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundedRange = exports.Range = exports.isNumericRangeLiteral = exports.isRangeLiteral = exports.isComparableDate = exports.isNumericRange = exports.isRange = void 0;
var INVALID_BOUNDS_ERR = "Invalid range bounds: ";
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function isRange(value) {
    return value instanceof Range;
}
exports.isRange = isRange;
function isNumericRange(value) {
    return (isRange(value) && isNumberOrNil(value.begin) && isNumberOrNil(value.end));
}
exports.isNumericRange = isNumericRange;
function isComparableDate(value) {
    return isObject(value) && "isBefore" in value;
}
exports.isComparableDate = isComparableDate;
function isInfinity(value) {
    return value === null || value === Infinity || value === -Infinity;
}
function isValidBounds(bounds) {
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
function boundToMathSymbols(bounds) {
    var lower = bounds[0] === "(" ? ">" : ">=";
    var upper = bounds[1] === ")" ? "<" : "<=";
    return { lower: lower, upper: upper };
}
var isNumberOrNil = function (value) {
    return !isNaN(value) || value === null || value === undefined;
};
var isRangeLiteral = function (v) {
    return typeof v === "object" &&
        !Array.isArray(v) &&
        "bounds" in v &&
        typeof v.bounds === "string" &&
        isValidBounds(v.bounds);
};
exports.isRangeLiteral = isRangeLiteral;
var isNumericRangeLiteral = function (v) {
    return (0, exports.isRangeLiteral)(v) && isNumberOrNil(v.upper) && isNumberOrNil(v.lower);
};
exports.isNumericRangeLiteral = isNumericRangeLiteral;
function compare(a, b) {
    if (a === undefined || b === undefined) {
        throw new RangeError("Cannot compare empty ranges");
    }
    if (isComparableDate(a) && isComparableDate(b)) {
        return a.isBefore(b) ? -1 : b.isBefore(a) ? 1 : 0;
    }
    return a < b ? -1 : b < a ? 1 : 0;
}
function stringify(value) {
    var _a;
    return isInfinity(value) ? "" : (_a = value === null || value === void 0 ? void 0 : value.toString()) !== null && _a !== void 0 ? _a : "";
}
var Range = (function () {
    function Range(begin, end, bounds) {
        if (bounds === void 0) { bounds = "[]"; }
        this.begin = begin;
        this.end = end;
        if (!isValidBounds(bounds)) {
            throw new RangeError(INVALID_BOUNDS_ERR + bounds);
        }
        this.bounds = bounds;
    }
    Range.compareBeginToBegin = function (a, b) {
        var aBegin = a.begin === null ? -Infinity : a.begin;
        var bBegin = b.begin === null ? -Infinity : b.begin;
        if (a.bounds[0] === b.bounds[0]) {
            return compare(aBegin, bBegin);
        }
        else {
            return compare(aBegin, bBegin) || (b.bounds[0] === "(" ? -1 : 1);
        }
    };
    Range.compareBeginToEnd = function (a, b) {
        var aBegin = a.begin === null ? -Infinity : a.begin;
        var bEnd = b.end === null ? Infinity : b.end;
        if (a.bounds[0] === "[" && b.bounds[1] === "]") {
            return compare(aBegin, bEnd);
        }
        else {
            return compare(aBegin, bEnd) || 1;
        }
    };
    Range.compareEndToEnd = function (a, b) {
        var aEnd = a.end === null ? Infinity : a.end;
        var bEnd = b.end === null ? Infinity : b.end;
        if (a.bounds[1] === b.bounds[1]) {
            return compare(aEnd, bEnd);
        }
        else {
            return compare(aEnd, bEnd) || (a.bounds[1] === ")" ? -1 : 1);
        }
    };
    Range.parse = function (range, parse) {
        if (range === "empty") {
            return new Range(undefined, undefined, "()");
        }
        var bounds = range[0] + range[range.length - 1];
        if (!isValidBounds(bounds)) {
            throw new RangeError(INVALID_BOUNDS_ERR + bounds);
        }
        var endpoints = range.slice(1, -1).split(",", 2);
        var begin = endpoints[0]
            ? parse
                ? parse(endpoints[0])
                : this.defaultValueParser(endpoints[0])
            : null;
        var end = endpoints[1]
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
        return new Range(begin, end, bounds);
    };
    Range.union = function (a, b) {
        var aIsEmpty = a.isEmpty();
        var bIsEmpty = b.isEmpty();
        if (aIsEmpty && bIsEmpty) {
            return new Range();
        }
        else if (aIsEmpty) {
            return b;
        }
        else if (bIsEmpty) {
            return a;
        }
        var begin = Range.compareBeginToBegin(a, b) <= 0 ? a : b;
        var end = Range.compareEndToEnd(a, b) <= 0 ? b : a;
        return new Range(begin.begin, end.end, begin.bounds);
    };
    Range.prototype.compareBegin = function (begin) {
        var a = this.begin === null ? -Infinity : this.begin;
        var b = begin === null ? -Infinity : begin;
        return compare(a, b) || (this.bounds[0] == "[" ? 0 : 1);
    };
    Range.prototype.compareEnd = function (end) {
        var a = this.end === null ? Infinity : this.end;
        var b = end === null ? Infinity : end;
        return compare(a, b) || (this.bounds[1] == "]" ? 0 : -1);
    };
    Range.prototype.isEmpty = function () {
        if (this.begin === null || this.end === null) {
            return false;
        }
        if (this.begin === undefined || this.end === undefined) {
            return true;
        }
        return this.bounds != "[]" && compare(this.begin, this.end) === 0;
    };
    Range.prototype.isBounded = function () {
        if (this.isEmpty()) {
            return true;
        }
        return !(isInfinity(this.begin) || isInfinity(this.end));
    };
    Range.prototype.lowerIsBounded = function () {
        if (this.isEmpty()) {
            return true;
        }
        return !isInfinity(this.begin);
    };
    Range.prototype.upperIsBounded = function () {
        if (this.isEmpty()) {
            return true;
        }
        return !isInfinity(this.end);
    };
    Range.prototype.isFinite = function () {
        return this.isBounded();
    };
    Range.prototype.isFullyUnbounded = function () {
        return isInfinity(this.begin) && isInfinity(this.end);
    };
    Range.prototype.isUnbounded = function () {
        return !this.isBounded();
    };
    Range.prototype.isInfinite = function () {
        return this.isUnbounded();
    };
    Range.prototype.contains = function (value) {
        var a = this.begin;
        var b = this.end;
        return ((b === null ||
            b === undefined ||
            (this.bounds[1] === "]"
                ? compare(value, b) <= 0
                : compare(value, b) < 0)) &&
            (a === null ||
                a === undefined ||
                (this.bounds[0] === "["
                    ? compare(a, value) <= 0
                    : compare(a, value) < 0)));
    };
    Range.prototype.intersects = function (other) {
        if (this.isEmpty()) {
            return false;
        }
        if (other.isEmpty()) {
            return false;
        }
        return (Range.compareBeginToEnd(this, other) <= 0 &&
            Range.compareBeginToEnd(other, this) <= 0);
    };
    Range.prototype.valueOf = function () {
        return [this.begin, this.end, this.bounds];
    };
    Range.prototype.toString = function () {
        if (this.isEmpty()) {
            return "empty";
        }
        var a = stringify(this.begin);
        var b = stringify(this.end);
        return this.bounds[0] + a + "," + b + this.bounds[1];
    };
    Range.prototype.toJSON = function () {
        return this.toString();
    };
    Range.prototype.inspect = function () {
        return this.toString();
    };
    Range.prototype.pgFormatBound = function (value, prepare) {
        if (prepare === void 0) { prepare = function (v) { return v.toString(); }; }
        if (value === null || value === undefined || isInfinity(value)) {
            return "";
        }
        return prepare(value);
    };
    Range.prototype.toPostgres = function (prepare) {
        if (prepare === void 0) { prepare = function (v) { return v.toString(); }; }
        if (this.isEmpty()) {
            return "empty";
        }
        var pgValue = "".concat(this.bounds[0]).concat(this.pgFormatBound(this.begin, prepare), ",").concat(this.pgFormatBound(this.end, prepare)).concat(this.bounds[1]);
        return pgValue;
    };
    Range.prototype.toDisplay = function () {
        if (this.isEmpty()) {
            return "empty";
        }
        if (this.isFullyUnbounded()) {
            return "infinite";
        }
        var _a = boundToMathSymbols(this.bounds), lower = _a.lower, upper = _a.upper;
        var parts = [];
        if (this.lowerIsBounded()) {
            parts.push("".concat(lower).concat(this.begin.toString()));
        }
        if (this.upperIsBounded()) {
            parts.push("".concat(upper).concat(this.end.toString()));
        }
        return parts.join(",");
    };
    Range.defaultValueParser = function (v) { return v; };
    return Range;
}());
exports.Range = Range;
var BoundedRange = (function (_super) {
    __extends(BoundedRange, _super);
    function BoundedRange(begin, end, bounds) {
        if (bounds === void 0) { bounds = "[]"; }
        var _this = _super.call(this, begin, end, bounds) || this;
        _this.begin = begin;
        _this.end = end;
        return _this;
    }
    return BoundedRange;
}(Range));
exports.BoundedRange = BoundedRange;
//# sourceMappingURL=range.js.map