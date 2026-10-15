"use strict";

const assert = require("node:assert/strict");
const buildParameters = require("../../../cms/server/admin/static/subtask_builder.js");

const names = ["sample01", "sample02", "hidden01"];
const parameters = buildParameters(names, [30, 70], {
    sample01: 0, sample02: 0, hidden01: 1
});
assert.deepEqual(parameters, [
    [30, "^(?:sample01|sample02)$"],
    [70, "^(?:hidden01)$"]
]);
assert.equal(new RegExp(parameters[0][1]).test("sample01"), true);
assert.equal(new RegExp(parameters[0][1]).test("sample02"), true);
assert.equal(new RegExp(parameters[0][1]).test("hidden01"), false);

assert.throws(() => buildParameters(names, [30, 70], {
    sample01: 0, sample02: 0
}), /Assign every testcase/);
assert.throws(() => buildParameters(names, [30, 70], {
    sample01: 0, sample02: 0, hidden01: 0
}), /at least one testcase/);
assert.throws(() => buildParameters(names, [30.5], {
    sample01: 0, sample02: 0, hidden01: 0
}), /whole-number/);

console.log("Subtask builder tests passed");
