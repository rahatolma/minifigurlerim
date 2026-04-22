"use strict";
var arr = [];
arr.map(function (item) { return item.does_not_exist; });
arr.sort(function (a, b) { return a.id - b.id; });
