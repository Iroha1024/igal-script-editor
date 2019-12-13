<template>
    <div class="editor">
        <component :is="fileType" :path="path" ref="file"></component>
    </div>
</template>

<script>
import path from 'path'
import fs from 'fs'

import Mousetrap from 'mousetrap'

import igal from '@/components/editor/igal/igal'
import Type from '@/utils/shortcutKey'

export default {
    data() {
        return {
            fileType: '',
        }
    },
    props: {
        path: String,
    },
    components: {
        igal,
    },
    created() {
        this.open()
    },
    mounted() {
        this.bindKeyEvent()
    },
    methods: {
        //打开对应格式组件
        open() {
            const fileType = path.extname(this.path)
            switch (fileType) {
                case '.igal':
                    this.fileType = 'igal'
                    break
                default:
                    break
            }
            // console.log(this.path, this.content);
        },
        bindKeyEvent() {
            //覆盖停止回调
            Mousetrap.prototype.stopCallback = function(e, element, combo) {
                return false
            }
            this.$nextTick(() => {
                const fileDOM = this.$refs['file'] && this.$refs['file'].$el
                if (fileDOM) {
                    Mousetrap(fileDOM).bind(Type.save, () => {
                        this.$refs['file'].save()
                    })
                }
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.editor {
    flex: 1;
    overflow-y: scroll;
}
</style>
