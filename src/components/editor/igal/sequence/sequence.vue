<template>
    <div class="sequence" ref="sequence" @input="input($event)">
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
                ref="child"
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
    data() {
        return {
            domToEditArea: new WeakMap(),
            domToChild: new WeakMap(),
        }
    },
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
            setDomToEditArea: this.setDomToEditArea,
            setDomToChild: this.setDomToChild,
            deleteDomRef: this.deleteDomRef,
        }
    },
    mounted() {
        this.bindKeyEvent()
    },
    methods: {
        //editArea dom-->editArea instance
        setDomToEditArea(dom, sequence) {
            this.domToEditArea.set(dom, sequence)
        },
        //editArea dom-->child instance
        setDomToChild(dom, child) {
            this.domToChild.set(dom, child)
        },
        deleteDomRef(dom) {
            this.domToEditArea.delete(dom)
            this.domToChild.delete(dom)
        },
        getChildDomByInfo(info) {
            return this.$refs.child.filter(item => item.info === info).pop().$el
        },
        //根据className返回当前显示组件
        inWhichComp(dom, className) {
            return dom.className.includes(className)
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
        //按键绑定
        bindKeyEvent() {
            const sequence = this.$refs.sequence
            this.addLineItem(sequence)
            this.addLine(sequence)
            this.deleteLineItem(sequence)
            this.deleteLine(sequence)
        },
        input(event) {
            const editArea = this.domToEditArea.get(event.target)
            //footer区域input直接结束
            if (!editArea) return
            //linbreak组件输入转化为sentence组件
            const transformLinebreak = () => {
                const info = {
                    name: '',
                    text: [
                        {
                            value: editArea.$el.innerText,
                            uuid: uuidv1(),
                        },
                    ],
                    remark: [
                        {
                            value: '',
                            uuid: uuidv1(),
                        },
                    ],
                    type: Type.sentence,
                    uuid: uuidv1(),
                }
                const index = this.sequence.data.indexOf(editArea.origin)
                this.sequence.data.splice(index, 1, info)
                this.$nextTick(() => {
                    console.log(this.domToEditArea)
                    const sentence = this.getChildDomByInfo(info)
                    const text = sentence.children[1]
                    const textNode = text.firstChild.firstChild
                    const selection = window.getSelection()
                    const range = document.createRange()
                    range.setStart(textNode, 1)
                    selection.addRange(range)
                })
            }
            if (!event.data && event.inputType !== 'deleteContentBackward')
                return
            if (editArea.origin.type === Type.linebreak) {
                transformLinebreak()
            } else {
                if (editArea.index !== undefined) {
                    editArea.origin[editArea.KEY][editArea.index].value =
                        editArea.$el.innerText
                } else {
                    editArea.origin[editArea.KEY] = editArea.$el.innerText
                }
            }
        },
        addLineItem(sequence) {
            Mousetrap(sequence).bind(Key.addLineItem, event => {
                event.preventDefault()
                const editArea = this.domToEditArea.get(event.target)
                if (editArea.index !== undefined) {
                    const arr = editArea.origin[editArea.KEY]
                    const info = {
                        value: '',
                        uuid: uuidv1(),
                    }
                    arr.splice(editArea.index + 1, 0, info)
                    this.$nextTick(() => {
                        const newLine =
                            editArea.$el.parentNode.children[editArea.index + 1]
                        this.focusLine(newLine)
                    })
                }
            })
        },
        addLine(sequence) {
            Mousetrap(sequence).bind(Key.addLine, event => {
                event.preventDefault()
                //当前事件节点
                const node = event.target
                const info = {
                    type: Type.linebreak,
                    uuid: uuidv1(),
                }
                //组件实例
                const child = this.domToChild.get(node)
                //组件dom
                const childDom = child.$el
                let index
                if (child) {
                    index = this.sequence.data.indexOf(child.info)
                }
                switch (true) {
                    //若在sentence，linebreak组件中enter，新建一行在下一行
                    case this.inWhichComp(childDom, Type.sentence):
                    case this.inWhichComp(childDom, Type.linebreak):
                        this.sequence.data.splice(index + 1, 0, info)
                        this.$nextTick(() => {
                            const newLine = childDom.nextSibling
                            this.focusLine(newLine)
                        })
                        break
                    //若在branch组件中enter，新建choice在最末尾
                    case this.inWhichComp(childDom, Type.branch):
                        const choice = {
                            value: '',
                            uuid: uuidv1(),
                        }
                        this.sequence.data[index].choices.push(choice)
                        this.$nextTick(() => {
                            const branch = childDom
                            const choices = branch.children[1]
                            const newLine =
                                choices.children[choices.children.length - 1]
                            this.focusLine(newLine)
                        })
                        break
                    //若在header区域enter，新建一行在最开头
                    default:
                        this.sequence.data.unshift(info)
                        this.$nextTick(() => {
                            const newLine = this.$refs.main.firstChild
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
        deleteLineItem(sequence) {
            Mousetrap(sequence).bind(Key.deleteLineItem, event => {
                const editArea = this.domToEditArea.get(event.target)
                let text
                try {
                    text = editArea.origin[editArea.KEY][editArea.index].value
                } catch {
                    return
                }
                if (editArea.index !== undefined && text === '') {
                    const arr = editArea.origin[editArea.KEY]
                    const info = {
                        value: '',
                        uuid: uuidv1(),
                    }
                    const parentNode = editArea.$el.parentNode
                    const focusLineIndex = this.deletionRule(
                        info,
                        arr,
                        editArea.index
                    )
                    this.$nextTick(() => {
                        const newLine = parentNode.children[focusLineIndex]
                        setTimeout(() => {
                            this.focusLine(newLine)
                        }, 100)
                    })
                }
            })
        },
        deleteLine(sequence) {
            Mousetrap(sequence).bind(Key.deleteLine, event => {
                event.preventDefault()
                const node = event.target
                //组件实例
                const child = this.domToChild.get(node)
                //组件dom
                const childDom = child.$el
                let index
                if (child) {
                    index = this.sequence.data.indexOf(child.info)
                }
                switch (true) {
                    case this.inWhichComp(childDom, Type.sentence):
                    case this.inWhichComp(childDom, Type.linebreak):
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
                            const info = this.sequence.data[focusLineIndex]
                            const nextLine = this.getChildDomByInfo(info)
                            this.focusLine(nextLine)
                        })
                        break
                    case this.inWhichComp(childDom, Type.branch):
                        this.$nextTick(() => {
                            const branch = childDom
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
