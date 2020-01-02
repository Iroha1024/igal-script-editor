const state = {
    //程序配置数据
    configData: null,
}

const mutations = {
    setConfigData(state, configData) {
        state.configData = configData
    },
}

export default {
    state,
    mutations,
}
