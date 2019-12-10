const path = require('path');

function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    chainWebpack: config => {
        config.resolve.symlinks(true)
        config.resolve.alias.set('@', resolve('src'))
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `@import "~@/assets/css/global.scss";@import "~@/assets/css/mixin.scss";`,
            },
        },
    },
    pluginOptions: {
        // electronBuilder: {
        //     productName: ''
        // }
    },
}