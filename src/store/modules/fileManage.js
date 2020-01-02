const state = {
    //项目下所有文件及文件夹
    files: [],
    //当前操作的文件
    file: null,
    //当前操作的文件夹
    dir: null,
    //当前被选择的文件或文件夹
    chosen: null,
}
const mutations = {
    setFiles(state, files) {
        state.files = files
    },
    setFile(state, file) {
        state.file = file
    },
    setDir(state, dir) {
        state.dir = dir
    },
    setChosen(state, chosen) {
        state.chosen = chosen
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
}

export default {
    state,
    mutations,
}
