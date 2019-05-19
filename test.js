const { performance } = require("perf_hooks");
const args = "args \"b c\"";
const getQuotedArgs = str => {
    const p = [];
    let s = "", o = false;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "\"" && str[i - 1] !== "\\") {
            o = !o;
            p.push(s);
            s = "";
            continue;
        }
        if (str.slice(i, i + 1) === " " && !o) {
            p.push(s);
            s = "";
            continue;
        }
        s += str[i];
    }
    return p.filter(t=>t!=="");
};
const start = performance.now();
const args1 = getQuotedArgs(args);
console.log((performance.now() - start) * 1000, args, args1);