const superagent = require("superagent");
const cheerio = require("cheerio");
const turndown = new (require("turndown"))();
turndown.addRule("hyperlink", {
    filter: "a",
    replacement: (text, e) => `[${text}](https://developer.mozilla.org${e.href})`
})

class MDNDocs {

    static async search(query = null) {
        if (!query) throw "No query specified.";        
        const $ = cheerio.load((await superagent.get(`https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}&topic=js`)).text);
        let resText = $("div[class=\"search-pane search-results-explanation\"]");
        resText = resText.children("p").text().split("\n").map(t=>t.trim()).filter(t=>t!=="").join("\n");
        if (resText === `0 documents found for "${query}" in English (US).`) return null;
        let resultUrl = $("li[class=\"result-1\"]")
            .children("div[class=\"column-container\"]")
            .children("div[class=\"column-5 result-list-item\"]")
            .children("h4").children("a").attr("href");
        return resultUrl;
    }

    static async load(result) {
        return new MDNDocResult((await superagent.get(result)).text);
    }

}

class MDNDocResult {

    constructor(text) {
        this.text = text;
        this.$ = cheerio.load(text);
    }

    get name() {
        return this.$("meta[property=\"og:title\"]").attr("content");
    }

    get description() {
        return turndown.turndown(this.$("p").html());
    }

    get url() {
        return this.$("meta[property=\"og:url\"]").attr("content");
    }

    get syntax() {
        const rgx = /<h[1-6] id="Syntax">Syntax<\/h[1-6]>/;
        const indexes = this.text.split("\n").map(t=>t.trim()).filter(t=>t!=="");
        let index = indexes.indexOf(rgx.test(this.text) ? rgx.exec(this.text)[0] : null);
        if (index === -1) return null;
        const $ = cheerio.load(indexes.slice(index+1).join("\n"));
        return turndown.turndown($("pre").first().html()).replace(/\//g, "");
    }

    get params() {
        const rgx = /<h[1-6] id="Parameters">Parameters<\/h[1-6]>/;
        const indexes = this.text.split("\n").map(t=>t.trim()).filter(t=>t!=="");
        let index = indexes.indexOf(rgx.test(this.text) ? rgx.exec(this.text)[0] : null);
        if (index === -1) return null;
        const params = [];
        const $ = cheerio.load(indexes.slice(index+1).join("\n"));
        $("dl").first().children().map((_, e) => params.push(turndown.turndown($(e).html())));
        return chunk(params, 2);
    }

    get methods() {
        const rgx = /<h[1-6] id="Methods">Methods<\/h[1-6]>/;
        const indexes = this.text.split("\n").map(t=>t.trim()).filter(t=>t!=="");
        let index = indexes.indexOf(rgx.test(this.text) ? rgx.exec(this.text)[0] : null);
        if (index === -1) return null;
        const methods = [];
        const $ = cheerio.load(indexes.slice(index+1).join("\n"));
        $("dl").first().children().map((_, e) => methods.push(turndown.turndown($(e).html())));
        return chunk(methods, 2);
    }

    get returnValue() {
        const rgx = /<h[1-6] id="Return_value">Return value<\/h[1-6]>/;
        const indexes = this.text.split("\n").map(t=>t.trim()).filter(t=>t!=="");
        const index = indexes.indexOf(rgx.test(this.text) ? rgx.exec(this.text)[0] : null);
        if (index === -1) return null;
        const $ = cheerio.load(indexes.slice(index+1).join("\n"));
        return turndown.turndown($("p").first().html());
    }

}

function chunk(arr, len) {
    const chunked = [];
    for (let i = 0; i < arr.length; i += len) chunked.push(arr.slice(i, i + len));
    return chunked;
}

module.exports = MDNDocs;