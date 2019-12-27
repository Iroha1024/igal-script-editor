<template>
    <div class="line">
        <data-layout
            v-for="([key, value], index) of Object.entries(info)"
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
// .type {
//     display: none;
// }
</style>
