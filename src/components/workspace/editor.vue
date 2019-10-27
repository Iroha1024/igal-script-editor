<template>
    <div class="editor">
        <component :is="component" :content.sync="content" :path="path" ref="file"></component>
    </div>
</template>

<script>
import path from 'path'

import { ipcRenderer } from 'electron'
import Mousetrap from 'mousetrap'

import igal from 'components/editor/igal/igal'
import Type from '@/shortcutKey'

export default {
    data() {
        return {
            content: '',
            component: ''
        }
    },
    props: {
        path: String,
    },
    components: {
        igal
    },
    created() {
        this.getContent()
        this.bindKeyEvent()
    },
    methods: {
        //获取文件内容，打开对应格式组件
        getContent() {
            this.content = ipcRenderer.sendSync('read-file', this.path)
            const fileType = path.extname(this.path)
            switch (fileType) {
                case '.igal':
                    this.component = 'igal'
                    break;
                default:
                    break;
            }
            // console.log(this.path, this.content);
        },
        bindKeyEvent() {
            //覆盖停止回调
            Mousetrap.prototype.stopCallback = function(e, element, combo) {
                return false
            }
            Mousetrap.bind(Type.save, () => {
                this.$refs['file'].$emit(Type.save)
            })
        }
    },
}
</script>

<style lang="scss" scoped>
    .editor {
        flex: 1;
    }
</style>
