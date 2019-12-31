<template>
    <div class="branch">
        <data-layout
            v-for="([key, value], index) of Object.entries(info)"
            v-if="!['uuid', 'type'].includes(key)"
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

export default {
    props: {
        info: Object,
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
    margin-top: 15px;
    border-radius: 10px;
    .question {
        border-bottom: $border-size $border-style $border-color;
    }
    /deep/ .choices > div + div {
        border-top: $border-size $border-style $border-color;
    }
}
</style>
