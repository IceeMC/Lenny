const superagent = require("superagent");
const cheerio = require("cheerio");

class MDNDocs {

    static async search(query = null) {
        if (!query) throw "No query specified.";        
        const $ = cheerio.load((await superagent.get(`https://developer.mozilla.org/en-US/search?q=${query}&topic=js`)).text);
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
        return md(this.$("meta[property=\"og:description\"]").attr("content"));
    }

    get url() {
        return this.$("meta[property=\"og:url\"]").attr("content");
    }

    get params() {
        const rgx = /<h[1-6] id="Parameters">Parameters<\/h[1-6]>/;
        const indexes = this.text.split("\n").map(t=>t.trim()).filter(t=>t!=="");
        let index = indexes.indexOf(rgx.test(this.text) ? rgx.exec(this.text)[0] : null);
        // Finally if no index just return null
        if (index === -1) return null;
        const params = [];
        const text = indexes.slice(index+1).join("\n");
        const $ = cheerio.load(text);
        $("dl").first().children().map((_, e) => params.push(md($(e).html())));
        return chunk(params, 2);
    }

    get methods() {
        const rgx = /<h[1-6] id="Methods">Methods<\/h[1-6]>/;
        const indexes = this.text.split("\n").map(t=>t.trim()).filter(t=>t!=="");
        let index = indexes.indexOf(rgx.test(this.text) ? rgx.exec(this.text)[0] : null);
        if (index === -1) return null;
        const methods = [];
        const text = indexes.slice(index+1).join("\n");
        const $ = cheerio.load(text);
        $("dl").first().children().map((_, e) => methods.push(md($(e).html())));
        return chunk(methods, 2);
    }

    get returnValue() {
        const rgx = /<h[1-6] id="Return_value">Return value<\/h[1-6]>/;
        const indexes = this.text.split("\n").map(t=>t.trim()).filter(t=>t!=="");
        const index = indexes.indexOf(rgx.test(this.text) ? rgx.exec(this.text)[0] : null);
        if (index === -1) return null;
        const text = indexes.slice(index+1).join("\n");
        const $ = cheerio.load(text);
        return md($("p").first().html());
    }

}

function chunk(arr, len) {
    const chunked = [];
    for (let i = 0; i < arr.length; i += len) chunked.push(arr.slice(i, i + len));
    return chunked;
}

function md(text) {
    return text
        .replace(/<a href=".*" title=".*">(.*)<\/a>/g, `$1`)
        .replace(/<\/?code>/g, "`")
        .replace(/<\/?span>/, "")
        .replace(/<strong>(.*)<\/strong>/, "**$1**")
        .replace(/<span class="inlineIndicator optional optionalInline">Optional/, " | Optional")
        .replace(/(&.*;|&#xA;)/g, " ");
}

module.exports = MDNDocs;