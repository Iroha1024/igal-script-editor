<template>
    <div class="sentence">
        <data-layout
            v-for="([key, value], index) of Object.entries(info)"
            v-if="['name', 'text', 'remark'].includes(key)"
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
                const MAX_LINE = Math.max(
                    newVal.text.length,
                    newVal.remark.length
                )
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
.sentence {
    display: flex;
    .name {
        flex: 0 0 20%;
        order: 1;
    }
    .text {
        flex: 0 0 40%;
        order: 2;
    }
    .remark {
        flex: 1;
        order: 3;
    }
}
</style>
