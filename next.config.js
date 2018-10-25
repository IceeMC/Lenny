const withCSS = require("@zeit/next-css");
const withBundleAnalyzer = require("@zeit/next-bundle-analyzer");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

module.exports = withBundleAnalyzer(withCSS({
    pageExtensions: ["jsx", "js"],
    pageExtensions: ["jsx", "js"],
    analyzeServer: ["server", "both"],
    analyzeBrowser: ["browser", "both"],
    bundleAnalyzerConfig: {
        server: {
            analyzerMode: "static",
            reportFilename: "../bundles/server.html"
        },
        browser: {
            analyzerMode: "static",
            reportFilename: "./bundles/client.html"
        }
    },  
    webpack(config) {
        config.plugins = config.plugins.filter(plugin => plugin.constructor.name !== "FriendlyErrorsWebpackPlugin");
        config.plugins.push(new FriendlyErrorsWebpackPlugin({
            clearConsole: false
        }));
        return config;
    }
}));