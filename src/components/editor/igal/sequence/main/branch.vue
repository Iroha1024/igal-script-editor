<template>
    <div class="branch">
        <data-layout
            v-for="([key, value], index) of Object.entries(info)"
            v-if="['question', 'choices'].includes(key)"
            :key="index"
            :class="key"
            :data="value"
            :origin="info"
            :KEY="key"
        ></data-layout>
    </div>
</template>

<script>
import dataLayout from '../dataLayout/dataLayout'

import { calcSize } from '@/utils/sequence/createSequence'

export default {
    props: {
        info: Object,
    },
    watch: {
        info: {
            handler(newVal) {
                const MAX_LINE = newVal.choices.length + 3
                if (newVal.MAX_LINE !== MAX_LINE) {
                    const size = calcSize()
                    this.info.MAX_LINE = MAX_LINE
                    this.info.size = this.info.MAX_LINE * size
                }
            },
            deep: true,
        },
    },
    components: {
        dataLayout,
    },
}
</script>

<style lang="scss" scoped>
.branch {
    text-align: center;
    border: $border-size $border-style $border-color !important;
    border-radius: 10px;
    margin: calc(var(--font-size) * var(--line-height)) 0;
    .question {
        border-bottom: $border-size $border-style $border-color;
    }
    /deep/ .choices > div + div {
        border-top: $border-size $border-style $border-color;
    }
}
</style>
