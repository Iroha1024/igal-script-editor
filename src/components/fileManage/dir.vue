<script>
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState(['files']),
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
        const file = (info, indent) => {
            return h('div', {
                class: {
                    file: true,
                },
                style: {
                    textIndent: indent + 'px',
                },
                domProps: {
                    innerHTML: info.name,
                },
                on: {
                    click: () => {
                        this.$router.push({ path: `/file/${info.path}` })
                    },
                },
            })
        }
        const renderDOM = (files, indent) => {
            let arr = []
            const indentVal = 15
            indent += indentVal
            for (let i = 0; i < files.length; i++) {
                const item = files[i]
                if (!Array.isArray(item)) {
                    if (item.type === 'file') {
                        const name = item.path.split('\\').pop()
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
}
</style>
