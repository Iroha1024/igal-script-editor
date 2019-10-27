<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<style lang="scss">
    @import '@/assets/css/reset';
    html {
        height: 100%;
        font-size: 25px;
    }
    body {
        height: inherit;
    }
    #app {
        height: inherit;
    }
</style>
