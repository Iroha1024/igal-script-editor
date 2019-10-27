<template>
    <div class="igal" contenteditable="true" ref="igal">
        {{ content }}
    </div>
</template>

<script>
import fs from 'fs'

import { ipcRenderer } from 'electron'

import paragraph from './paragraph'
import Type from '@/shortcutKey'

export default {
    name: 'igal',
    props: {
        content: String,
        path: String
    },
    components: {
        paragraph
    },
    created() {
        this.save()
    },
    methods: {
        save() {
            this.$on(Type.save, () => {
                let data = this.$refs.igal.innerHTML
                // console.log(data);
                data = data.replace(/<div>/g, '').replace(/<\/div>/g, '\r\n').replace(/<br>/g, '')
                // console.log(data);
                fs.writeFile(this.path, data, (err) => {
                    if (err) throw err
                    this.update()
                })
            })
        },
        update() {
            //清除页面内容
            let parent = this.$refs.igal
            let children = parent.children
            for (let len = children.length, i = len - 1; i >= 0; i--) {
                parent.removeChild(children[i])
            }
            //更新
            const content = ipcRenderer.sendSync('read-file', this.path)
            console.log(content);
            this.$emit('update:content', content)
        },
    }
}
</script>

<style lang="scss" scoped>
    .igal {
        height: 100%;
        outline: none;
        overflow-y: scroll;
        padding: 20px;
        word-break: break-all;
    }
</style>
