import Vue from 'vue'
import Vuex from 'vuex'

import { readAllSequences } from '@/utils/readIgal'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        //项目文件夹路径
        dirPath: '',
        //项目配置文件路径
        configPath: '',
        //项目下所有文件及文件夹
        files: [],
        //项目下所有序列uuid
        uuids: [],
    },
    mutations: {
        setDirPath(state, path) {
            state.dirPath = path
        },
        setConfigPath(state, path) {
            state.configPath = path
        },
        setFiles(state, files) {
            state.files = files
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
