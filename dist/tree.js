"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeTree = void 0;
var range_1 = require("./range");
function dedupe(ranges, range) {
    var last = ranges[ranges.length - 1];
    if (last && range_1.Range.compareBeginToBegin(last[0], range[0]) === 0) {
        last.push(range[0]);
    }
    else {
        ranges.push(range);
    }
    return ranges;
}
function arrayify(obj) {
    return [obj];
}
function isNotEmpty(range) {
    return !range.isEmpty();
}
function reverseCompareEndToEnd(a, b) {
    return range_1.Range.compareEndToEnd(a, b) * -1;
}
var RangeTree = (function () {
    function RangeTree(keys, left, right) {
        if (Array.isArray(keys)) {
            this.keys = keys.slice().sort(reverseCompareEndToEnd);
        }
        else {
            this.keys = [keys];
        }
        this.left = left || null;
        this.right = right || null;
        var a = this.left ? this.left.range : this.keys[0];
        var b = this.right
            ? range_1.Range.union(this.keys[0], this.right.range)
            : this.keys[0];
        this.range = range_1.Range.union(a, b);
    }
    RangeTree.from = function (ranges) {
        var deduped = ranges
            .filter(isNotEmpty)
            .sort(range_1.Range.compareBeginToBegin)
            .map(arrayify)
            .reduce(dedupe, []);
        return RangeTree.new(deduped);
    };
    RangeTree.new = function (ranges) {
        switch (ranges.length) {
            case 0:
                return new RangeTree(new range_1.Range());
            case 1:
                return new RangeTree(ranges[0]);
            case 2:
                return new RangeTree(ranges[0], null, new RangeTree(ranges[1]));
            default: {
                var middle = Math.floor(ranges.length / 2);
                var left = RangeTree.new(ranges.slice(0, middle));
                var right = RangeTree.new(ranges.slice(middle + 1));
                return new RangeTree(ranges[middle], left, right);
            }
        }
    };
    RangeTree.prototype.search = function (valueOrRange) {
        if (valueOrRange instanceof range_1.Range) {
            return this.searchByRange(valueOrRange);
        }
        else {
            return this.searchByValue(valueOrRange);
        }
    };
    RangeTree.prototype.searchByValue = function (value) {
        if (!this.range.contains(value)) {
            return [];
        }
        var ownPosition = this.keys[0].compareBegin(value);
        return [
            this.left ? this.left.searchByValue(value) : [],
            ownPosition <= 0 ? this.searchOwnByValue(value) : [],
            this.right && ownPosition < 0 ? this.right.searchByValue(value) : [],
        ].flat();
    };
    RangeTree.prototype.searchByRange = function (range) {
        if (!this.range.intersects(range)) {
            return [];
        }
        var ownPosition = range_1.Range.compareBeginToEnd(this.keys[0], range);
        return [
            this.left ? this.left.searchByRange(range) : [],
            ownPosition <= 0 ? this.searchOwnByRange(range) : [],
            this.right && ownPosition < 0 ? this.right.searchByRange(range) : [],
        ].flat();
    };
    RangeTree.prototype.searchOwnByValue = function (value) {
        return this.keys
            .filter(function (r) {
            return r.contains(value);
        })
            .reverse();
    };
    RangeTree.prototype.searchOwnByRange = function (range) {
        return this.keys
            .filter(function (r) {
            return r.intersects(range);
        })
            .reverse();
    };
    return RangeTree;
}());
exports.RangeTree = RangeTree;
//# sourceMappingURL=tree.js.map