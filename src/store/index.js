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
        //当前操作的文件
        file: null,
        //当前操作的文件夹
        dir: null,
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
        setFile(state, file) {
            state.file = file
        },
        setDir(state, dir) {
            state.dir = dir
        },
        //删除未完成文件
        deleteIncompletefile(state, file) {
            let remove
            if (file.type === 'dir') {
                remove = files => {
                    let list
                    function findArrOfDir(files) {
                        if (files.includes(file)) return files
                        for (const item of files) {
                            if (Array.isArray(item)) {
                                list = findArrOfDir(item)
                                if (list) {
                                    files.splice(files.indexOf(list), 1)
                                }
                            }
                        }
                    }
                    findArrOfDir(files)
                }
            } else {
                remove = files => {
                    if (files.includes(file)) {
                        files.splice(files.indexOf(file), 1)
                    }
                    for (const arr of files) {
                        if (Array.isArray(arr)) remove(arr)
                    }
                }
            }
            remove(state.files)
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
