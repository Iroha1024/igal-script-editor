<template>
    <div id="app">
        <keep-alive>
            <router-view :key="$route.path"></router-view>
        </keep-alive>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'

import Mousetrap from '@/utils/Mousetrap'
import setStyle from '@/utils/setStyle'

export default {
    created() {
        this.setConfigData()
        this.skipToConfig()
    },
    computed: {
        ...mapState(['configData']),
    },
    watch: {
        configData: {
            handler(newVal) {
                setStyle(newVal)
            },
            deep: true
        },
    },
    methods: {
        setConfigData() {
            ipcRenderer.send('read-config')
            ipcRenderer.on('get-config', (event, configData) => {
                this.$store.commit('setConfigData', configData)
            })
        },
        //测试用，跳转页面
        skipToConfig() {
            Mousetrap.bind('ctrl+up', () => {
                this.$router.push({ path: '/config' })
            })
        },
    },
}
</script>

<style lang="scss">
html {
    height: 100%;
    font-size: var(--font-size);
    font-family: var(--font-family);
}
body,
#app {
    height: inherit;
}
</style>
