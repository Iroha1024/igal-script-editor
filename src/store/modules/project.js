import { readAllSequences } from '@/utils/igal/readIgal'

const state = {
    //项目文件夹路径
    dirPath: '',
    //项目配置文件路径setting.json
    configPath: '',
    //file-->uuids
    fileToUuids: new Map(),
    //项目下所有序列uuid
    uuids: [],
    //存放path-->igal的初始化map
    initIgalData: null,
}

const mutations = {
    setDirPath(state, path) {
        state.dirPath = path
    },
    setConfigPath(state, path) {
        state.configPath = path
    },
    setFileToUuids(state, { file, uuids }) {
        state.fileToUuids.set(file, uuids)
    },
    deleteFileToUuids(state, file) {
        state.fileToUuids.delete(file)
    },
    setuuids(state) {
        state.uuids = [...state.fileToUuids].flatMap(([key, value]) => value)
    },
    setInitIgalData(state, initIgalData) {
        state.initIgalData = initIgalData
    },
}

const actions = {
    async updateUuids(
        { state, commit, rootState },
        { init = false, file, uuids } = {}
    ) {
        if (init) {
            const files = rootState.fileManage.files
            const initIgalData = await readAllSequences(
                files,
                state.fileToUuids,
                state.configPath
            )
            commit('setInitIgalData', initIgalData)
        } else {
            if (uuids) {
                commit('setFileToUuids', { file, uuids })
            } else {
                commit('deleteFileToUuids', file)
            }
        }
        commit('setuuids')
    },
}

export default {
    state,
    mutations,
    actions,
}
