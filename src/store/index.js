import Vue from 'vue'
import Vuex from 'vuex'

import fileManage from './modules/fileManage'
import program from './modules/program'
import project from './modules/project'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        fileManage,
        program,
        project,
    },
})

export default store
