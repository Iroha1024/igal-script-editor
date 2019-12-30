<template>
    <div class="editor">
        <component :is="fileType" :path="path" ref="file"></component>
    </div>
</template>

<script>
import Path from 'path'

import igal from '@/components/editor/igal/igal'
import Key from '@/utils/shortcutKey'
import Mousetrap from '@/utils/Mousetrap'

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
            const fileType = Path.extname(this.path)
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
            this.$nextTick(() => {
                const fileDOM = this.$refs['file'] && this.$refs['file'].$el
                if (fileDOM) {
                    Mousetrap(fileDOM).bind(Key.save, () => {
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
