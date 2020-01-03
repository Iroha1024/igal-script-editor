import { readAllSequences } from '@/utils/igal/readIgal'

const state = {
    //项目文件夹路径
    dirPath: '',
    //项目配置文件路径setting.json
    configPath: '',
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
    setInitIgalData(state, initIgalData) {
        state.initIgalData = initIgalData
    },
}

const actions = {
    async updateUuids({ state, commit, rootState }, { init = false } = {}) {
        const files = rootState.fileManage.files
        const { initIgalData, sequenceList } = await readAllSequences(
            files,
            state.configPath
        )
        state.uuids = sequenceList.map(sequence => sequence.uuid)
        if (init) commit('setInitIgalData', initIgalData)
    },
}

export default {
    state,
    mutations,
    actions,
}
