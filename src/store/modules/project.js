import { readAllSequences } from '@/utils/igal/readIgal'

const state = {
    //项目文件夹路径
    dirPath: '',
    //项目配置文件路径setting.json
    configPath: '',
    //项目下所有序列uuid
    uuids: [],
}

const mutations = {
    setDirPath(state, path) {
        state.dirPath = path
    },
    setConfigPath(state, path) {
        state.configPath = path
    },
}

const actions = {
    async updateUuids({ state }) {
        const list = await readAllSequences(state.dirPath, state.configPath)
        state.uuids = list.map(sequence => sequence.uuid)
    },
}

export default {
    state,
    mutations,
    actions,
}
