<template>
    <div class="igal" ref="igal">
        <paragraph v-for="(item, index) of list" :key="item.id" :content="item"></paragraph>
    </div>
</template>

<script>
import fs from 'fs'

import { ipcRenderer } from 'electron'

import paragraph from './paragraph/paragraph'
import Type from 'utils/shortcutKey'
import Mark from 'utils/mark'

export default {
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
                    } else if (node.nodeName === 'BR' && node.className === 'br') {
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
                nodeList.forEach(node =>{
                    if (node) {
                        data += node.nodeValue
                    }
                    data += '\r\n'
                })
                console.log(data);
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
            queryString(Mark.header_start, Mark.header_end, 'header')
            queryString(Mark.header_end, Mark.footer_start, 'main')
            queryString(Mark.footer_start, Mark.footer_end, 'footer')
            // console.log(content);
            // console.log(this.list);
            const changeMain = index => {
                let main = this.list[index].main
                let arr = [],
                    temp = []
                for (let i = 0; i < main.length; i++) {
                    const element = main[i]
                    if (element === '') {
                        if (temp.length) {
                            arr.push(temp)
                            temp = []
                        }
                        arr.push(element)
                    } else {
                        if (element.includes('>') && temp.length) {
                            arr.push(temp)
                            temp = []
                        }
                        if (element.includes('>')) {
                            temp.push({ name: element, text: [] })
                        } else {
                            temp[0].text.push(element)
                        }
                    }
                }
                temp.length && arr.push(temp)
                // console.log(arr);
                this.list[index].main = arr
            }
            for (let i = 0; i < this.list.length; i++) {
                changeMain(i)
            }
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
