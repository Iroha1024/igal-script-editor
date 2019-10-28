<template>
    <div class="igal" ref="igal">
        <paragraph v-for="(item, index) of list" :key="item.id" :content="item"></paragraph>
    </div>
</template>

<script>
import fs from 'fs'

import { ipcRenderer } from 'electron'

import paragraph from './paragraph'
import Type from '@/shortcutKey'

export default {
    name: 'igal',
    data() {
        return {
            list: []
        }
    },
    props: {
        content: String,
        path: String
    },
    components: {
        paragraph
    },
    created() {
        this.analysisContent()
        this.save()
    },
    methods: {
        save() {
             function getTextNode(parent) {
                let nodeList = Array.from(parent.childNodes)
                nodeList = nodeList.map(node => {
                    if (node.nodeType === 3) {
                        return node
                    } else if (node.nodeName === 'BR') {
                        return null
                    } else {
                        return getTextNode(node).flat()
                    }
                })
                nodeList = nodeList.flat()
                return nodeList
            }
            this.$on(Type.save, () => {
                 let nodeList = getTextNode(this.$refs.igal)
                console.log(nodeList);
                let data = ''
                // nodeList.forEach(node =>{
                //     if (node) {
                //         data += node[0].nodeValue
                //     }
                //     data += '\r\n'
                // })
                // console.log(data);
                // fs.writeFile(this.path, data, (err) => {
                //     if (err) throw err
                //     this.update()
                // })
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
        analysisContent() {
            let content = this.content.split('\r\n')
            const header_start = '##'
            const header_end = '###'
            const footer_start = '--'
            const footer_end = '---'
            const queryString = (start, end, type) => {
                for (let i = 0, prev = 0, next = 0, num = 0; i < content.length; i++) {
                    const item = content[i]
                    if (item === start) {
                        prev = content.indexOf(start, i)
                        next = content.indexOf(end, i)
                        if (!this.list[num]) {
                            this.list[num] = {}
                            this.list[num].id = num
                        }
                        this.list[num][type] = []
                        while (prev < next - 1) {
                            prev++
                            this.list[num][type].push(content[prev])
                        }
                        num++
                    }
                }
            }
            queryString(header_start, header_end, 'header')
            queryString(header_end, footer_start, 'main')
            queryString(footer_start, footer_end, 'footer')
            // console.log(content);
            // console.log(this.list);
        },
    }
}
</script>

<style lang="scss" scoped>
    .igal {
        height: 100%;
        padding: 20px;
        word-break: break-all;
        box-sizing: border-box;
    }
</style>
