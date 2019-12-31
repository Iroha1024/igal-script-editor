<template>
    <div
        class="edit-area"
        contenteditable="true"
        v-text="innerText"
        @input="input($event)"
    ></div>
</template>

<script>
import uuidv1 from 'uuid/v1'

import { Type } from '@/utils/sequence/mark'
import Key from '@/utils/shortcutKey'
import Mousetrap from '@/utils/Mousetrap'

export default {
    props: {
        origin: Object,
        KEY: String,
        index: Number,
    },
    data() {
        return {
            innerText: '',
        }
    },
    inject: ['sequence', 'getMainChild', 'focusLine', 'deletionRule'],
    created() {
        if (this.index !== undefined) {
            this.innerText = this.origin[this.KEY][this.index].value
        } else {
            this.innerText = this.origin[this.KEY]
        }
        if (this.origin.type === Type.linebreak) {
            this.innerText = ''
        }
    },
    mounted() {
        this.$nextTick(() => {
            Mousetrap(this.$el).bind(Key.addLineItem, event => {
                event.preventDefault()
                if (this.index !== undefined) {
                    const arr = this.origin[this.KEY]
                    const info = {
                        value: '',
                        uuid: uuidv1(),
                    }
                    arr.splice(this.index + 1, 0, info)
                    this.$nextTick(() => {
                        const newLine = this.$el.parentNode.children[
                            this.index + 1
                        ]
                        this.focusLine(newLine)
                    })
                }
            })
            Mousetrap(this.$el).bind(Key.deleteLineItem, event => {
                const text = this.origin[this.KEY][this.index].value
                if (this.index !== undefined && text === '') {
                    const arr = this.origin[this.KEY]
                    const info = {
                        value: '',
                        uuid: uuidv1(),
                    }
                    const parentNode = this.$el.parentNode
                    const focusLineIndex = this.deletionRule(
                        info,
                        arr,
                        this.index
                    )
                    this.$nextTick(() => {
                        const newLine = parentNode.children[focusLineIndex]
                        setTimeout(() => {
                            this.focusLine(newLine)
                        }, 100)
                    })
                }
            })
        })
    },
    methods: {
        input(event) {
            if (!event.data && event.inputType !== 'deleteContentBackward')
                return
            if (this.origin.type === Type.linebreak) {
                this.transformLinebreak()
            } else {
                if (this.index !== undefined) {
                    this.origin[this.KEY][this.index].value = this.$el.innerText
                } else {
                    this.origin[this.KEY] = this.$el.innerText
                }
            }
        },
        //linbreak组件输入转化为sentence组件
        transformLinebreak() {
            const info = {
                name: '',
                text: [
                    {
                        value: this.$el.innerText,
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
            const index = this.sequence.data.indexOf(this.origin)
            this.sequence.data.splice(index, 1, info)
            this.$nextTick(() => {
                const sentence = this.getMainChild(index)
                const text = sentence.children[1]
                const textNode = text.firstChild.firstChild
                const selection = window.getSelection()
                const range = document.createRange()
                range.setStart(textNode, 1)
                selection.addRange(range)
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.edit-area {
    outline: none;
}
</style>
