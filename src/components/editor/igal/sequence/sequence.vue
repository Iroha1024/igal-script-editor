<template>
    <div class="sequence" ref="sequence">
        <header>
            <customized-info
                :customized="sequence.customized"
            ></customized-info>
        </header>
        <main ref="main">
            <component
                :is="item.type"
                v-for="(item, index) of sequence.data"
                :key="item.uuid"
                :info="item"
            ></component>
        </main>
        <footer>
            <button-area :sequence="sequence"></button-area>
        </footer>
    </div>
</template>

<script>
import uuidv1 from 'uuid/v1'

import customizedInfo from './header/customizedInfo'
import sentence from './main/sentence'
import linebreak from './main/linebreak'
import branch from './main/branch'
import buttonArea from './footer/buttonArea'

import { Type } from '@/utils/sequence/mark.js'
import Key from '@/utils/shortcutKey'
import Mousetrap from '@/utils/Mousetrap'

export default {
    props: {
        sequence: Object,
    },
    components: {
        customizedInfo,
        sentence,
        linebreak,
        branch,
        buttonArea,
    },
    provide() {
        return {
            sequence: this.sequence,
            getMainChild: this.getMainChild,
        }
    },
    mounted() {
        const sequence = this.$refs.sequence
        this.newLine(sequence)
        this.deleteLine(sequence)
    },
    methods: {
        getMainChild(index) {
            return this.$refs.main.children[index]
        },
        //获取显示组件，若没找到，返回div.sequence
        getDisplayComp(editNode) {
            const nodeClassList = [Type.sentence, Type.linebreak, Type.branch]
            let currentNode = editNode
            do {
                currentNode = currentNode.parentNode
                if (nodeClassList.includes(currentNode.className)) break
            } while (!currentNode.className.includes('sequence'))
            return currentNode
        },
        //光标换行
        focusLine(newLine) {
            const selection = window.getSelection()
            selection.removeAllRanges()
            const range = document.createRange()
            //找到不为注释的首个子节点
            function getFirstChildNode(node) {
                if (node.children.length < 1) {
                    return node
                } else if (node.nodeType !== 8) {
                    for (const item of node.children) {
                        return getFirstChildNode(item)
                    }
                }
            }
            const node = getFirstChildNode(newLine)
            console.log(node)
            range.setStart(node, 0)
            selection.addRange(range)
        },
        inWhichArea(className, displayComp) {
            return className.includes(displayComp.className)
        },
        newLine(sequence) {
            Mousetrap(sequence).bind(Key.newLine, event => {
                event.preventDefault()
                const node = event.target
                const displayComp = this.getDisplayComp(node)
                const info = {
                    type: Type.linebreak,
                    uuid: uuidv1(),
                }
                const index = [...this.$refs.main.children].indexOf(displayComp)
                switch (true) {
                    //若在header区域enter，新建一行在最开头
                    case displayComp === this.$el:
                        this.sequence.data.unshift(info)
                        this.$nextTick(() => {
                            const newLine = this.getMainChild(0)
                            this.focusLine(newLine)
                        })
                        break
                    //若在sentence，linebreak组件中enter，新建一行在下一行
                    case this.inWhichArea(Type.sentence, displayComp):
                    case this.inWhichArea(Type.linebreak, displayComp):
                        this.sequence.data.splice(index + 1, 0, info)
                        this.$nextTick(() => {
                            const newLine = this.getMainChild(index + 1)
                            this.focusLine(newLine)
                        })
                        break
                    //若在branch组件中enter，新建choice在最末尾
                    case this.inWhichArea(Type.branch, displayComp):
                        const choice = ''
                        this.sequence.data[index].choices.push(choice)
                        this.$nextTick(() => {
                            const branch = this.getMainChild(index)
                            const choices = branch.children[1]
                            const newLine =
                                choices.children[choices.children.length - 1]
                            this.focusLine(newLine)
                        })
                        break
                }
            })
        },
        deleteLine(sequence) {
            Mousetrap(sequence).bind(Key.deleteLine, event => {
                event.preventDefault()
                const node = event.target
                const displayComp = this.getDisplayComp(node)
                const index = [...this.$refs.main.children].indexOf(displayComp)
                function deleteItem(info, arr, index) {
                    let focusLineIndex
                    if (index === 0) {
                        arr.splice(0, 1, info)
                        focusLineIndex = 0
                    } else {
                        arr.splice(index, 1)
                        focusLineIndex = index - 1
                    }
                    if (index === 0 && arr.length > 1) {
                        arr.splice(0, 1)
                    }
                    return focusLineIndex
                }
                switch (true) {
                    case this.inWhichArea(Type.sentence, displayComp):
                    case this.inWhichArea(Type.linebreak, displayComp):
                        const info = {
                            type: Type.linebreak,
                            uuid: uuidv1(),
                        }
                        const focusLineIndex = deleteItem(
                            info,
                            this.sequence.data,
                            index
                        )
                        this.$nextTick(() => {
                            const nextLine = this.getMainChild(focusLineIndex)
                            this.focusLine(nextLine)
                        })
                        break
                    case this.inWhichArea(Type.branch, displayComp):
                        // this.$nextTick(() => {
                        //     const branch = this.getMainChild(index)
                        //     const choices = branch.children[1]
                        //     const choiceIndex = [...choices.children].indexOf(
                        //         node
                        //     )
                        //     const choice = ''
                        //     const focusLineIndex = deleteItem(choice, this.sequence.data[index].choices, choiceIndex)
                        //     console.log('choiceIndex', choiceIndex);
                        //     console.log('focusLineIndex', focusLineIndex);
                        //     this.$nextTick(() => {
                        //         const nextLine = choices.children[focusLineIndex]
                        //         this.focusLine(nextLine)
                        //     })
                        // })
                        break
                }
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.sequence {
    background-color: #ebebeb91;
    border-radius: 0 0 10px 10px;
    padding: $sequence-padding;
    margin-bottom: 20px;
}
</style>
