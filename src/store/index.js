import Vue from 'vue'
import Vuex from 'vuex'

import { readAllSequences } from '@/utils/readIgal'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        dirPath: '',
        configPath: '',
        uuids: [],
    },
    mutations: {
        setDirPath(state, path) {
            state.dirPath = path
        },
        setConfigPath(state, path) {
            state.configPath = path
        },
    },
    actions: {
        async updateUuids({ state }) {
            const list = await readAllSequences(state.dirPath, state.configPath)
            state.uuids = list.map(sequence => sequence.uuid)
        },
    },
})

export default store
