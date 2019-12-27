<template>
    <div
        class="edit-area"
        contenteditable="true"
        v-text="innerText"
        @input="changeData"
    ></div>
</template>

<script>
import { Type } from '@/utils/sequence/mark'

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
    inject: ['sequence', 'getNode'],
    created() {
        if (this.index !== undefined) {
            this.innerText = this.origin[this.KEY][this.index]
        } else {
            this.innerText = this.origin[this.KEY]
        }
        if (this.origin.type === Type.linebreak) {
            this.innerText = ''
        }
    },
    methods: {
        changeData() {
            if (this.origin.type === Type.linebreak) {
                this.transformLinebreak()
            } else {
                if (this.index !== undefined) {
                    this.origin[this.KEY][this.index] = this.$el.innerText
                } else {
                    this.origin[this.KEY] = this.$el.innerText
                }
            }
        },
        //linbreak组件输入转化为sentence组件
        transformLinebreak() {
            const info = {
                name: '',
                text: [this.$el.innerText],
                remark: [''],
                type: Type.sentence,
            }
            const index = this.sequence.data.indexOf(this.origin)
            this.sequence.data.splice(index, 1, info)
            this.$nextTick(() => {
                const sentence = this.getNode(index)
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
