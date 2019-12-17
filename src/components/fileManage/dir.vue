<script>
import fs from 'fs'

import { mapState } from 'vuex'

import writeIgal from '@/utils/writeIgal'

export default {
    data() {
        return {
            value: '',
        }
    },
    computed: {
        ...mapState(['configPath', 'files', 'file']),
    },
    mounted() {
        this.clickControl()
    },
    methods: {
        checkHasSameName(upperPath, newPath) {
            return fs
                .readdirSync(upperPath)
                .some(file => newPath === `${upperPath}\\${file}`)
        },
        /**
         * 根据输入值`value`新增文件和重命名文件
         *
         * 不输入值直接返回，退出编辑状态`isEdit=false`
         *
         * 1、新建文件：重名直接返回
         *
         * 2、重命名：重名或与自身相同直接返回
         *
         */
        operateFile(file) {
            if (!file) return
            file.isEdit = false
            if (this.value) {
                //新建文件
                if (file.isNewBuilt) {
                    const upperPath = file.path
                    file.path += `\\${this.value}`
                    this.value = ''
                    if (!file.path.endsWith('.igal')) {
                        file.path += '.igal'
                    }
                    if (this.checkHasSameName(upperPath, file.path)) {
                        this.$store.commit('deleteIncompletefile', file)
                        return
                    }
                    file.name = file.path.split('\\').pop()
                    writeIgal(this.configPath, file.path).then(() => {
                        file.isNewBuilt = false
                        this.$router.push({
                            path: `/file/${file.path}`,
                        })
                    })
                } else {
                    //重命名文件，先将path改为上级路径
                    const upperPath = file.path
                        .split('\\')
                        .slice(0, -1)
                        .join('\\')
                    let newPath = `${upperPath}\\${this.value}`
                    this.value = ''
                    if (!newPath.endsWith('.igal')) {
                        newPath += '.igal'
                    }
                    if (
                        file.oldPath === newPath ||
                        this.checkHasSameName(upperPath, newPath)
                    ) {
                        console.log('rename same')
                        return
                    }
                    file.path = newPath
                    fs.renameSync(file.oldPath, file.path)
                    file.oldPath = file.path
                }
            } else if (file.isNewBuilt) {
                this.$store.commit('deleteIncompletefile', file)
            }
        },
        //点击控制文件编辑状态
        clickControl() {
            const click = event => {
                //不会自动消除的区域id
                const noEffectId = ['input', 'createFile', 'rename']
                if (!noEffectId.includes(event.target.id)) {
                    this.operateFile(this.file)
                    this.$store.commit('setFile', null)
                }
            }
            const rightClick = () => {
                this.operateFile(this.file)
                this.$store.commit('setFile', null)
            }
            //左键单击其他区域
            window.addEventListener('click', click)
            //右键单击其他区域
            window.addEventListener('contextmenu', rightClick)
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
        const dir = (info, indent) => {
            return h('div', {
                class: {
                    dir: true,
                },
                attrs: {
                    id: 'dir',
                    path: info.path,
                },
                style: {
                    textIndent: indent + 'px',
                },
                domProps: {
                    innerHTML: info.name,
                },
            })
        }
        const fileChild = info => {
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
                                this.operateFile(info)
                            }
                        },
                    },
                })
                this.$nextTick(() => {
                    input.elm.focus()
                })
                return input
            } else {
                return h('p', {
                    attrs: {
                        id: 'file',
                        path: info.path,
                    },
                    domProps: {
                        innerHTML: info.name,
                    },
                })
            }
        }
        const file = (info, indent) => {
            return h(
                'div',
                {
                    class: {
                        file: true,
                    },
                    style: {
                        textIndent: indent + 'px',
                    },
                    on: {
                        click: () => {
                            this.$router.push({ path: `/file/${info.path}` })
                        },
                    },
                },
                [fileChild(info)]
            )
        }
        const renderDOM = (files, indent) => {
            let arr = []
            const indentVal = 15
            indent += indentVal
            for (let i = 0; i < files.length; i++) {
                const item = files[i]
                if (!Array.isArray(item)) {
                    if (item.type === 'file') {
                        let name = ''
                        if (item.name !== '') {
                            name = item.path.split('\\').pop()
                        }
                        item.name = name
                        item.oldPath = item.path
                        const _file = file(item, indent)
                        arr.push(_file)
                    } else if (item.type === 'dir') {
                        const name = item.path.split('\\').pop()
                        item.name = name
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
        return renderDOM(this.files, 0)
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
}
</style>
