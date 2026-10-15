(function () {
    "use strict";

    function escapeRegex(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function buildParameters(names, groups, assignments) {
        if (!names.length || !groups.length) {
            throw new Error("Add testcases and at least one subtask.");
        }
        var points = groups.map(Number);
        if (points.some(function (value) {
            return !Number.isInteger(value) || value <= 0;
        })) {
            throw new Error("Every subtask needs a positive whole-number score.");
        }
        var members = groups.map(function () { return []; });
        names.forEach(function (name) {
            var index = assignments[name];
            if (!Number.isInteger(index) || index < 0 || index >= groups.length) {
                throw new Error("Assign every testcase to one subtask.");
            }
            members[index].push(name);
        });
        if (members.some(function (group) { return group.length === 0; })) {
            throw new Error("Each subtask must contain at least one testcase.");
        }
        return members.map(function (group, index) {
            return [points[index], "^(?:" + group.map(escapeRegex).join("|") + ")$"];
        });
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = buildParameters;
    }

    function init(root) {
        var id = root.getAttribute("data-dataset-id");
        var names = Array.prototype.map.call(
            root.querySelectorAll("[data-testcase-name]"),
            function (item) { return item.getAttribute("data-testcase-name"); });
        var parameters = document.querySelector(
            '[name="score_type_parameters_' + id + '"]');
        var scoreType = document.querySelector('[name="score_type_' + id + '"]');
        var groups = [];
        var assignments = {};
        var message = root.querySelector(".subtask-message");
        var editor = root.querySelector(".subtask-editor");

        function note(value, isError) {
            message.textContent = value;
            message.style.color = isError ? "#a00000" : "#276327";
        }

        function importExisting() {
            if (scoreType.value !== "GroupMin") { return false; }
            var parsed;
            try { parsed = JSON.parse(parameters.value); } catch (error) { return false; }
            if (!Array.isArray(parsed) || !parsed.length) { return false; }
            var allNumbers = parsed.every(function (item) {
                return Array.isArray(item) && Number.isInteger(item[1]); });
            var allStrings = parsed.every(function (item) {
                return Array.isArray(item) && typeof item[1] === "string"; });
            if (!allNumbers && !allStrings) { return false; }
            var remaining = names.slice();
            var imported = {};
            for (var i = 0; i < parsed.length; i++) {
                var item = parsed[i];
                if (!Array.isArray(item) || item.length !== 2) { return false; }
                var matched;
                if (Number.isInteger(item[1])) {
                    matched = remaining.splice(0, item[1]);
                } else if (typeof item[1] === "string") {
                    try {
                        var pattern = new RegExp(item[1]);
                        matched = names.filter(function (name) {
                            return pattern.test(name); });
                    } catch (error) { return false; }
                } else { return false; }
                if (!matched.length) { return false; }
                for (var j = 0; j < matched.length; j++) {
                    if (Object.prototype.hasOwnProperty.call(imported, matched[j])) {
                        return false;
                    }
                    imported[matched[j]] = i;
                }
            }
            groups = parsed.map(function (item) { return item[0]; });
            assignments = imported;
            return true;
        }

        function render() {
            editor.textContent = "";
            var groupTitle = document.createElement("h5");
            groupTitle.textContent = "Subtasks and points";
            editor.appendChild(groupTitle);
            groups.forEach(function (points, index) {
                var row = document.createElement("div");
                row.style.margin = "6px 0";
                var label = document.createElement("label");
                label.textContent = "Subtask " + (index + 1) + " — points: ";
                var input = document.createElement("input");
                input.type = "number";
                input.min = "1";
                input.step = "1";
                input.value = points;
                input.style.width = "70px";
                input.addEventListener("input", function () { groups[index] = input.value; });
                label.appendChild(input);
                row.appendChild(label);
                if (groups.length > 1) {
                    var remove = document.createElement("button");
                    remove.type = "button";
                    remove.textContent = "Remove";
                    remove.style.marginLeft = "8px";
                    remove.addEventListener("click", function () {
                        groups.splice(index, 1);
                        names.forEach(function (name) {
                            if (assignments[name] === index) { delete assignments[name]; }
                            else if (assignments[name] > index) { assignments[name]--; }
                        });
                        render();
                    });
                    row.appendChild(remove);
                }
                editor.appendChild(row);
            });
            var add = document.createElement("button");
            add.type = "button";
            add.textContent = "+ Add subtask";
            add.addEventListener("click", function () { groups.push(1); render(); });
            editor.appendChild(add);

            var title = document.createElement("h5");
            title.textContent = "Assign every testcase to exactly one subtask";
            editor.appendChild(title);
            names.forEach(function (name) {
                var row = document.createElement("div");
                row.style.margin = "4px 0";
                var label = document.createElement("label");
                label.textContent = name + " → ";
                var select = document.createElement("select");
                var empty = document.createElement("option");
                empty.value = "";
                empty.textContent = "Choose subtask";
                select.appendChild(empty);
                groups.forEach(function (_points, index) {
                    var option = document.createElement("option");
                    option.value = String(index);
                    option.textContent = "Subtask " + (index + 1);
                    select.appendChild(option);
                });
                select.value = Object.prototype.hasOwnProperty.call(assignments, name) ?
                    String(assignments[name]) : "";
                select.addEventListener("change", function () {
                    if (select.value === "") { delete assignments[name]; }
                    else { assignments[name] = Number(select.value); }
                });
                label.appendChild(select);
                row.appendChild(label);
                editor.appendChild(row);
            });
        }

        if (!names.length) {
            note("Add testcases before building subtasks.", true);
            return;
        }
        if (!importExisting()) {
            groups = [100];
            names.forEach(function (name) { assignments[name] = 0; });
            if (scoreType.value === "GroupMin" && parameters.value.trim()) {
                note("Existing parameters could not be imported; they stay unchanged until Apply is clicked.", true);
            }
        }
        render();

        root.querySelector(".subtask-apply").addEventListener("click", function () {
            var result;
            try { result = buildParameters(names, groups, assignments); }
            catch (error) { note(error.message, true); return; }
            scoreType.value = "GroupMin";
            parameters.value = JSON.stringify(result);
            var total = result.reduce(function (sum, item) {
                return sum + item[0]; }, 0);
            note("GroupMin parameters prepared (total " + total +
                 " points). Click Update below to save. One failed testcase gives its entire subtask 0 points.", false);
        });
    }

    function ready() {
        Array.prototype.forEach.call(
            document.querySelectorAll(".subtask-builder"), init);
    }
    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", ready);
        } else { ready(); }
    }
}());
