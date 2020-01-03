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

import { Type } from '@/utils/sequence/mark'
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
            focusLine: this.focusLine,
            deletionRule: this.deletionRule,
        }
    },
    mounted() {
        const sequence = this.$refs.sequence
        this.addLine(sequence)
        this.deleteLine(sequence)
    },
    methods: {
        //根据index在main中查找所属节点
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
            let node = getFirstChildNode(newLine)
            if (node.textContent) {
                const index = node.textContent.length
                range.setStart(node.firstChild, index)
            } else {
                range.setStart(node, 0)
            }
            selection.addRange(range)
        },
        //根据className返回当前显示组件
        inWhichComp(className, displayComp) {
            return className.includes(displayComp.className)
        },
        addLine(sequence) {
            Mousetrap(sequence).bind(Key.addLine, event => {
                event.preventDefault()
                //当前事件节点
                const node = event.target
                //当前显示组件（sentence、linebreak、branch）
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
                    case this.inWhichComp(Type.sentence, displayComp):
                    case this.inWhichComp(Type.linebreak, displayComp):
                        this.sequence.data.splice(index + 1, 0, info)
                        this.$nextTick(() => {
                            const newLine = this.getMainChild(index + 1)
                            this.focusLine(newLine)
                        })
                        break
                    //若在branch组件中enter，新建choice在最末尾
                    case this.inWhichComp(Type.branch, displayComp):
                        const choice = {
                            value: '',
                            uuid: uuidv1(),
                        }
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
        /**
         * 删除第一项元素则将其用info替换
         *
         * 删除其余项则删除后光标跳转至上一行
         *
         * 若在删除第一项时，兄弟节点大于1时，直接删除该元素，光标不变
         */
        deletionRule(info, arr, index) {
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
        },
        deleteLine(sequence) {
            Mousetrap(sequence).bind(Key.deleteLine, event => {
                event.preventDefault()
                const node = event.target
                const displayComp = this.getDisplayComp(node)
                const index = [...this.$refs.main.children].indexOf(displayComp)
                switch (true) {
                    case this.inWhichComp(Type.sentence, displayComp):
                    case this.inWhichComp(Type.linebreak, displayComp):
                        const info = {
                            type: Type.linebreak,
                            uuid: uuidv1(),
                        }
                        const focusLineIndex = this.deletionRule(
                            info,
                            this.sequence.data,
                            index
                        )
                        this.$nextTick(() => {
                            const nextLine = this.getMainChild(focusLineIndex)
                            this.focusLine(nextLine)
                        })
                        break
                    case this.inWhichComp(Type.branch, displayComp):
                        this.$nextTick(() => {
                            const branch = this.getMainChild(index)
                            const choices = branch.children[1]
                            //无法在question区域中删除
                            if (![...choices.children].includes(node)) return
                            const choiceIndex = [...choices.children].indexOf(
                                node
                            )
                            const choice = {
                                value: '',
                                uuid: uuidv1(),
                            }
                            const focusLineIndex = this.deletionRule(
                                choice,
                                this.sequence.data[index].choices,
                                choiceIndex
                            )
                            this.$nextTick(() => {
                                const nextLine =
                                    choices.children[focusLineIndex]
                                this.focusLine(nextLine)
                            })
                        })
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
    main > div {
        &:nth-child(1) {
            border-top: $border-size $border-style $border-color;
        }
        border-bottom: $border-size $border-style $border-color;
    }
}
</style>
