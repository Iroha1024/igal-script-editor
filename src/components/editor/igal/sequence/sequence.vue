<template>
    <div class="sequence" ref="sequence" @input="input($event)">
        <header>
            <customized-info
                :customized="sequence.customized"
            ></customized-info>
        </header>
        <main ref="main">
            <RecycleScroller
                class="scroller"
                :items="sequence.data"
                key-field="uuid"
                page-mode
            >
                <template v-slot="{ item, index }">
                    <component
                        :style="{ height: computedHeight(item, index) }"
                        :is="item.type"
                        :key="item.uuid"
                        :info="item"
                        :ref="`child-${item.uuid}`"
                    ></component>
                </template>
            </RecycleScroller>
        </main>
        <footer>
            <button-area :sequence="sequence"></button-area>
        </footer>
    </div>
</template>

<script>
import uuidv1 from 'uuid/v1'
import { debounce } from 'lodash'

import customizedInfo from './header/customizedInfo'
import sentence from './main/sentence'
import linebreak from './main/linebreak'
import branch from './main/branch'
import buttonArea from './footer/buttonArea'

import { Type } from '@/utils/sequence/mark'
import Key from '@/utils/shortcutKey'
import Mousetrap from '@/utils/Mousetrap'
import {
    createLinebreak,
    createSentence,
    createBranch,
    calcSize,
} from '@/utils/sequence/createSequence'

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
            deleteEditAreaRef: this.deleteEditAreaRef,
        }
    },
    inject: ['setDomToSequence', 'deleteSequenceRef', 'focusLine'],
    mounted() {
        this.setDomToSequence(this.$el, this)
        this.bindKeyEvent()
    },
    beforeDestroy() {
        this.deleteSequenceRef(this.$el)
    },
    methods: {
        //最后一项可能出现样式无法显示，修改height
        computedHeight(item, index) {
            if (
                index === this.sequence.data.length - 1 &&
                item.type !== Type.branch
            ) {
                return item.size - 1.5 + 'px'
            }
        },
        //删除多余的child ref
        deleteRef: debounce(function () {
            Object.entries(this.$refs).forEach(([key, value]) => {
                if (!value) {
                    this.$delete(this.$refs, key)
                }
            })
            console.log(this.sequence.uuid, this.$refs)
        }, 2000),
        //editArea dom-->editArea instance
        setDomToEditArea(dom, editArea) {
            this.domToEditArea.set(dom, editArea)
        },
        //editArea dom-->child instance(e.g. <customized-info> <component>)
        setDomToChild(dom, child) {
            this.domToChild.set(dom, child)
        },
        deleteEditAreaRef(dom) {
            this.domToEditArea.delete(dom)
            this.domToChild.delete(dom)
        },
        getChildDomByInfo(info) {
            return Object.values(this.$refs).find(
                item => item && item.info === info
            ).$el
        },
        //根据className返回当前显示组件
        inWhichComp(dom, className) {
            return dom.className.includes(className)
        },
        //光标换行，滑轮居中
        focus(dom) {
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
            this.focusLine(dom, getFirstChildNode, {
                block: 'center',
            })
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
            /**
             * @param {Object} info 子组件信息
             * @param {number} nodeIndex 自动聚焦节点在父节点的index
             * @param {number} focusOffset 聚焦偏移量
             */
            const transform = (info, nodeIndex, focusOffset) => {
                const index = this.sequence.data.indexOf(editArea.origin)
                this.sequence.data.splice(index, 1, info)
                this.$nextTick(() => {
                    const childDom = this.getChildDomByInfo(info)
                    const node = childDom.children[nodeIndex]
                    let textNode
                    if (focusOffset === 0) {
                        textNode = node.firstChild
                    } else {
                        textNode = node.firstChild.firstChild
                    }
                    const selection = window.getSelection()
                    selection.removeAllRanges()
                    const range = document.createRange()
                    range.setStart(textNode, focusOffset)
                    selection.addRange(range)
                })
            }
            //linbreak组件输入转化为sentence组件
            const transformLinebreak = () => {
                const info = createSentence(editArea.$el.innerText)
                const offset = event.data.length
                transform(info, 1, offset)
            }
            //linbreak组件输入转化为branch组件
            const transformBranch = () => {
                const info = createBranch()
                transform(info, 0, 0)
            }
            const isLastChild = () => {
                return (
                    this.sequence.data.indexOf(editArea.origin) ===
                    this.sequence.data.length - 1
                )
            }
            if (!event.data && event.inputType !== 'deleteContentBackward')
                return
            if (editArea.origin.type === Type.linebreak) {
                const keyWord = ['?', '？']
                if (keyWord.includes(event.data) && isLastChild()) {
                    transformBranch()
                } else {
                    transformLinebreak()
                }
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
                    const infoItem = {
                        value: '',
                        uuid: uuidv1(),
                    }
                    arr.splice(editArea.index + 1, 0, infoItem)
                    this.$nextTick(() => {
                        const newLine =
                            editArea.$el.parentNode.children[editArea.index + 1]
                        this.focus(newLine)
                    })
                }
            })
        },
        addLine(sequence) {
            Mousetrap(sequence).bind(Key.addLine, event => {
                event.preventDefault()
                //当前事件节点
                const node = event.target
                const info = createLinebreak()
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
                            const newLine = this.getChildDomByInfo(info)
                            this.focus(newLine)
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
                            this.focus(newLine)
                        })
                        break
                    //若在header区域enter，新建一行在最开头
                    default:
                        this.sequence.data.unshift(info)
                        this.$nextTick(() => {
                            const newLine = this.getChildDomByInfo(info)
                            this.focus(newLine)
                        })
                        break
                }
            })
        },
        /**
         * 若在删除第一项时，兄弟节点大于1时，直接删除该元素，光标不变
         *
         * 若只有一项时，用info替换
         *
         * 删除其余项则删除后光标跳转至上一行
         */
        deletionRule(info, arr, index) {
            let focusLineIndex
            if (index === 0) {
                if (arr.length > 1) {
                    arr.splice(0, 1)
                } else {
                    arr.splice(0, 1, info)
                }
                focusLineIndex = 0
            } else {
                arr.splice(index, 1)
                focusLineIndex = index - 1
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
                    const infoItem = {
                        value: '',
                        uuid: uuidv1(),
                    }
                    const parentNode = editArea.$el.parentNode
                    const focusLineIndex = this.deletionRule(
                        infoItem,
                        arr,
                        editArea.index
                    )
                    this.$nextTick(() => {
                        const newLine = parentNode.children[focusLineIndex]
                        setTimeout(() => {
                            this.focus(newLine)
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
                this.deleteRef()
                const inQuestion = () => {
                    const branch = childDom
                    const question = childDom.children[0]
                    if ([...question.children].includes(node)) return true
                }
                switch (true) {
                    case this.inWhichComp(childDom, Type.sentence):
                    case this.inWhichComp(childDom, Type.linebreak):
                    case this.inWhichComp(childDom, Type.branch) &&
                        inQuestion():
                        const info = createLinebreak()
                        const focusLineIndex = this.deletionRule(
                            info,
                            this.sequence.data,
                            index
                        )
                        this.$nextTick(() => {
                            const info = this.sequence.data[focusLineIndex]
                            const nextLine = this.getChildDomByInfo(info)
                            this.focus(nextLine)
                        })
                        break
                    case this.inWhichComp(childDom, Type.branch):
                        this.$nextTick(() => {
                            const branch = childDom
                            const choices = branch.children[1]
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
                                this.focus(nextLine)
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
    .scroller {
        height: 100%;
        /deep/ .vue-recycle-scroller__item-wrapper {
            border-top: $border-size $border-style $border-color;
            .vue-recycle-scroller__item-view > div {
                box-sizing: border-box;
                border-bottom: $border-size $border-style $border-color;
            }
        }
    }
}
</style>
