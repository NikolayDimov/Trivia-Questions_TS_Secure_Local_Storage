const path = require("path");

module.exports = [
    {
        name: "webworker",
        target: "webworker",
        entry: "./worker.ts",
        output: { filename: "worker.js" },
    },
    {
        mode: "development",
        entry: "./src/index.ts",
        output: {
            filename: "bundle.js",
            path: path.resolve(__dirname, "dist"),
            publicPath: "dist",
        },
        devtool: "inline-source-map",
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        devServer: {
            contentBase: path.join(__dirname, "dist"),
            compress: true,
            port: 5500,
        },
    },
];
