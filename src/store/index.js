import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        dirPath: '',
        configPath: '',
    },
    mutations: {
        setDirPath(state, path) {
            state.dirPath = path
        },
        setConfigPath(state, path) {
            state.configPath = path
        },
    },
})

export default store
