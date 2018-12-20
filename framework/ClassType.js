require("v8").setFlagsFromString("--allow-natives-syntax");
const getPromiseDetails = require("vm").runInThisContext("p => p instanceof Promise ? [%PromiseStatus(p), %PromiseResult(p)] : null");
const i = ["boolean", "function", "number", "string", "symbol"];

class ClassType {

    constructor(type) {
        this.type = type;
    }

    _getMapChildren(map) {
        if (!map.size) return `${map.constructor.name}[]`;
        const keys = [...map.keys()].map(k => this.resolve(k)).filter(this.unique.bind(this))
        const values = [...map.values()].map(v => this.resolve(v)).filter(this.unique.bind(this));
        return `${map.constructor.name}[${keys.join(" : ")}, ${values.join(" : ")}]`;
    }

    _getArrayChildren(array = []) {
        if (!array.length) return "Array[]";
        const arrChildren = [];
        array.map(elem => arrChildren.push(this.resolve(elem)));
        return `Array[${arrChildren.filter(this.unique.bind(this)).join(", ")}]`;
    }

    _getSetValues(set) {
        if (!set.size) return `${set.constructor.name}[]`;
        return `${set.constructor.name}[${[...set.values()].map(v => this.resolve(v)).filter(this.unique.bind(this)).join(", ")}]`;
    }

    instance(type) {
        if (type instanceof Map) return this._getMapChildren(type);
        if (type instanceof Set) return this._getSetValues(type);
        if (Array.isArray(type)) return this._getArrayChildren(type);
        return !i.includes(typeof type) ? type.constructor.name !== "Object" ? type.constructor.name : "any" : typeof type;
    }

    toString() {
        return this.resolve(this.type);
    }

    resolve(type) {
        const promise = this.isPromise(type);
        type = promise ? getPromiseDetails(type)[1] : type;
        const t = typeof type;
        switch (t) {
            case "object": return type === null ? "null" : this.fmt(promise, type);
            case "function": return `${type.name}[${this.type.length < 1 ? "1-arg" : `${type.length}-args`}]`;
            case "undefined": return "void";
            default: return this.instance(type) || "any";
        }
    }

    fmt(promise, t) {
        return promise ? `Promise[${this.instance(t)}]` : this.instance(t);
    }

    isPromise(promise) {
        return promise instanceof Promise || (promise && typeof promise.then === "function" && typeof promise.catch === "function") || false;
    }

    unique(value, index, array) {
        return array.indexOf(value) === index;
    }

}

module.exports = ClassType;