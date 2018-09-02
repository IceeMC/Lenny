

class Test {

    get() {
        return "lol";
    }

    lol() {
        return "get";
    }

    *getFunctions() {
        return getFunctions(this).entries();
    }

}

console.log(new Test().getFunctions());