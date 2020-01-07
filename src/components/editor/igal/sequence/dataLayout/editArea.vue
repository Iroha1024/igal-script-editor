<template>
    <div class="edit-area" contenteditable="true" v-text="innerText"></div>
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
    inject: ['setDomToEditArea', 'setDomToChild', 'deleteEditAreaRef'],
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
        this.setDomToEditArea(this.$el, this)
        this.setDomToChild(this.$el, this.$parent.$parent)
    },
    beforeDestroy() {
        this.deleteEditAreaRef(this.$el)
    },
}
</script>

<style lang="scss" scoped>
.edit-area {
    outline: none;
}
</style>
