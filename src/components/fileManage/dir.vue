<script>
import fs from 'fs'

import { mapState } from 'vuex'

import writeIgal from '@/utils/writeIgal'
import { findArrOfDir } from '@/utils/findOrigin'

export default {
    data() {
        return {
            value: '',
        }
    },
    computed: {
        ...mapState(['configPath', 'files', 'file', 'dir', 'chosen']),
    },
    mounted() {
        this.clickControl()
    },
    methods: {
        /**
         * 检查是否重名
         * @param {string} upperPath 上级路径
         * @param {string} newPath 新路径
         * @returns {boolean}
         */
        checkHasSameName(upperPath, newPath) {
            return fs
                .readdirSync(upperPath)
                .some(file => newPath === `${upperPath}\\${file}`)
        },
        /**
         * 获取当前路径的上一级路径
         * @param {string} path 文件路径
         * @returns {string}
         */
        getupperPath(path) {
            return path
                .split('\\')
                .slice(0, -1)
                .join('\\')
        },
        /**
         * 若新增文件不为json，且不为igal，则自动加上.igal后缀
         * @param {string} path 文件路径
         * @param {boolean} isAddSuffix 是否添加后缀
         */
        addSuffix(path, isAddSuffix) {
            if (
                isAddSuffix &&
                !path.endsWith('.json') &&
                !path.endsWith('.igal')
            ) {
                return `${path}.igal`
            }
            return path
        },
        /**
         * 根据输入值`value`新增文件（夹）和重命名文件（夹）
         *
         * 不输入值直接返回，退出编辑状态`isEdit=false`
         *
         * 1、新建：重名直接返回
         *
         * 2、重命名：重名或与自身相同直接返回
         *
         * @param {*} info 文件（夹）信息
         * @param {boolean} isAddSuffix 是否添加后缀
         * @param {Function} callback 后续执行函数
         */
        operate(info, isAddSuffix, callback) {
            if (!info) return
            info.isEdit = false
            if (this.value) {
                //新建
                if (info.isNewBuilt) {
                    const upperPath = info.path
                    info.path += `\\${this.value}`
                    this.value = ''
                    info.path = this.addSuffix(info.path, isAddSuffix)
                    if (this.checkHasSameName(upperPath, info.path)) {
                        console.log('new same')
                        this.$store.commit('deleteIncompletefile', info)
                        return
                    }
                    info.name = info.path.split('\\').pop()
                    callback()
                } else {
                    //重命名，先将path改为上级路径
                    const upperPath = this.getupperPath(info.path)
                    let newPath = `${upperPath}\\${this.value}`
                    this.value = ''
                    newPath = this.addSuffix(newPath, isAddSuffix)
                    if (
                        info.oldPath === newPath ||
                        this.checkHasSameName(upperPath, newPath)
                    ) {
                        console.log('rename same')
                        return
                    }
                    info.path = newPath
                    fs.renameSync(info.oldPath, info.path)
                    info.oldPath = info.path
                }
            } else if (info.isNewBuilt) {
                this.$store.commit('deleteIncompletefile', info)
            }
        },
        operateFile(file) {
            this.operate(file, true, () => {
                writeIgal(this.configPath, file.path).then(() => {
                    file.isNewBuilt = false
                    this.$router.push({
                        path: `/file/${file.path}`,
                    })
                })
            })
        },
        operateDir(dir) {
            this.operate(dir, false, () => {
                fs.mkdir(dir.path, () => {
                    dir.isNewBuilt = false
                })
            })
        },
        //点击控制文件编辑状态
        clickControl() {
            const click = event => {
                //不会自动消除的区域id
                const noEffectId = [
                    'input',
                    'createFile',
                    'rename',
                    'createDir',
                ]
                if (!noEffectId.includes(event.target.id)) {
                    this.operateFile(this.file)
                    this.$store.commit('setFile', null)
                    this.operateFile(this.dir)
                    this.$store.commit('setDir', null)
                }
            }
            const rightClick = () => {
                this.operateFile(this.file)
                this.$store.commit('setFile', null)
                this.operateFile(this.dir)
                this.$store.commit('setDir', null)
            }
            //左键单击其他区域
            window.addEventListener('click', click)
            //右键单击其他区域
            window.addEventListener('contextmenu', rightClick)
        },
        /**
         * 切换文件夹状态
         *
         * 只有点击的文件夹切换折叠状态`isFolded`
         *
         * 其他文件及文件夹根据点击的文件夹改变`isShow`状态
         * @param {Object} info 文件夹信息
         * @param {Array} arr 文件夹所在数组
         */
        toggleShow(info, arr) {
            for (const item of arr) {
                if (item.type === 'dir' && item.path === info.path) {
                    item.isFolded = !item.isFolded
                } else {
                    if (info.isFolded) {
                        item.isShow = false
                    } else {
                        item.isShow = true
                    }
                }
                if (Array.isArray(item)) {
                    this.toggleShow(info, item)
                }
            }
        },
    },
    render(h) {
        const dirWrapper = arr => {
            return h(
                'div',
                {
                    class: {
                        dirWrapper: true,
                    },
                },
                arr
            )
        }
        const child = (info, id, operate) => {
            if (info.isEdit) {
                const input = h('input', {
                    class: {
                        input: true,
                    },
                    attrs: {
                        id: 'input',
                    },
                    domProps: {
                        value: info.name,
                    },
                    on: {
                        input: event => {
                            this.value = event.target.value
                        },
                        keydown: event => {
                            //回车
                            if (event.keyCode === 13) {
                                operate(info)
                            }
                        },
                    },
                })
                this.$nextTick(() => {
                    input.elm.focus()
                })
                return input
            } else {
                return h(
                    'div',
                    {
                        class: {
                            'child-wrapper': true,
                        },
                    },
                    [
                        h('div', {
                            class: {
                                icon: true,
                                iconfont: true,
                                'icon-weibiaoti5':
                                    info.isFolded && id === 'dir',
                                'icon-wenjianjia':
                                    !info.isFolded && id === 'dir',
                                'icon-text': id === 'file',
                            },
                            attrs: {
                                id,
                                path: info.path,
                            },
                        }),
                        h('div', {
                            class: {
                                name: true,
                            },
                            attrs: {
                                id,
                                path: info.path,
                            },
                            domProps: {
                                innerHTML: info.name,
                            },
                        }),
                    ]
                )
            }
        }
        const dirChild = info => {
            return child(info, 'dir', this.operateDir)
        }
        const dir = (info, indent) => {
            return h(
                'div',
                {
                    class: {
                        dir: true,
                        hidden: !info.isShow,
                        chosen: info === this.chosen,
                    },
                    style: {
                        paddingLeft: indent + 'px',
                    },
                    on: {
                        click: () => {
                            this.$store.commit('setChosen', info)
                            const arr = findArrOfDir(this.files, info.path)
                            this.toggleShow(info, arr)
                            this.files.__ob__.dep.notify()
                        },
                    },
                },
                [dirChild(info)]
            )
        }
        const fileChild = info => {
            return child(info, 'file', this.operateFile)
        }
        const file = (info, indent) => {
            return h(
                'div',
                {
                    class: {
                        file: true,
                        hidden: !info.isShow,
                        chosen: info === this.chosen,
                    },
                    style: {
                        paddingLeft: indent + 'px',
                    },
                    on: {
                        click: () => {
                            this.$store.commit('setChosen', info)
                            this.$router.push({ path: `/file/${info.path}` })
                        },
                    },
                },
                [fileChild(info)]
            )
        }
        const renderDOM = (files, indent) => {
            //设置公共属性
            function setProp(item) {
                let name = ''
                if (item.name !== '') {
                    name = item.path.split('\\').pop()
                }
                item.name = name
                item.oldPath = item.path
                if (!item.hasOwnProperty('isShow')) {
                    item.isShow = true
                }
            }
            let arr = []
            const indentVal = 15
            indent += indentVal
            for (let i = 0; i < files.length; i++) {
                const item = files[i]
                if (!Array.isArray(item)) {
                    if (item.type === 'file') {
                        setProp(item)
                        const _file = file(item, indent)
                        arr.push(_file)
                    } else if (item.type === 'dir') {
                        setProp(item)
                        if (!item.hasOwnProperty('isFolded')) {
                            item.isFolded = false
                        }
                        const _dir = dir(item, indent - indentVal)
                        arr.push(_dir)
                    }
                } else {
                    arr.push(renderDOM(item, indent))
                }
            }
            // console.log(arr);
            return dirWrapper(arr)
        }
        return renderDOM(this.files, 5)
    },
}
</script>

<style lang="scss" scoped>
@mixin hover() {
    &:hover {
        cursor: pointer;
        background-color: $list-hover-color;
    }
}
@mixin item() {
    padding: 4px 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.dirWrapper {
    font-size: 22px;
    line-height: 30px;
    .dir {
        @include hover;
        @include item;
    }
    .file {
        @include hover;
        @include item;
    }
    .input {
        width: 80%;
        height: 28px;
        border: 1px solid transparent;
        padding: 0 3px;
        outline: none;
        font-size: 20px;
        &:focus {
            border: 1px solid #538ee7;
        }
    }
    .child-wrapper {
        display: flex;
        .icon {
        }
        .name {
            flex: 1;
            padding-left: 5px;
        }
    }
    .hidden {
        display: none;
    }
    .chosen {
        background-color: #c7c7c7;
        &:hover {
            background-color: #c7c7c7;
        }
    }
}
</style>
