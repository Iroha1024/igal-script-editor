<template>
    <div class="branch" :Target.prop="info">
        <data-layout
            v-for="([key, value], index) of Object.entries(info)"
            :key="index"
            :class="key"
            :data="value"
            :Key.prop="key"
        ></data-layout>
    </div>
</template>

<script>
import dataLayout from '../dataLayout'

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
    // .question {
    // }
    // .choices {
    // }
    .type {
        display: none;
    }
}
</style>
