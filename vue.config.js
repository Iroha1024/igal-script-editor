const path = require('path');

function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    chainWebpack: config => {
        config.resolve.symlinks(true);
        config.resolve.alias
            .set('@', resolve('src'))
            .set('components', resolve('src/components'))
    },
    css: {
        loaderOptions: {
            // sass: {
            //     data: `@import "~@/assets/css/variable.scss";@import "~@/assets/css/mixin.scss";`
            // }
        }
    },
    pluginOptions: {
        // electronBuilder: {
        //     productName: ''
        // }
    }
}