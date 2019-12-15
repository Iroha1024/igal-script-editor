<script>
import { mapState } from 'vuex'

import eventBus from '@/eventBus'
import writeIgal from '@/utils/writeIgal'

export default {
    computed: {
        ...mapState(['configPath', 'files']),
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
            let value = ''
            let rename = false
            eventBus.$on('rename', () => {
                info.isShowInput = true
                rename = true
            })
            if (info.isShowInput) {
                return h('input', {
                    class: {
                        input: true,
                    },
                    domProps: {
                        value: info.name,
                    },
                    on: {
                        input: event => {
                            value = event.target.value
                        },
                        keydown: event => {
                            //回车
                            if (event.keyCode === 13) {
                                info.isShowInput = false
                                if (value) {
                                    info.path += `\\${value}`
                                    if (!info.path.endsWith('.igal'))
                                        info.path += '.igal'
                                    info.name = info.path.split('\\').pop()
                                    if (rename) {
                                    } else {
                                        writeIgal(this.configPath, info.path)
                                    }
                                }
                            }
                        },
                    },
                })
            } else {
                return h('p', {
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
    margin: 3px 0;
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
        border: 0;
        padding: 0;
        outline: none;
        font-size: 22px;
    }
}
</style>
