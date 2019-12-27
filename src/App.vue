<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'

import Mousetrap from '@/utils/Mousetrap'
import { setFontSize } from '@/utils/setStyle'

export default {
    created() {
        this.setConfigData()
        this.skipToConfig()
    },
    computed: {
        ...mapState(['configData']),
    },
    watch: {
        configData(newVal) {
            setFontSize(newVal.fontSize)
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
}
body,
#app {
    height: inherit;
}
</style>
