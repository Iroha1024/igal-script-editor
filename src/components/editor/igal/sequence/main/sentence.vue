<template>
    <div class="sentence" :Target.prop="info">
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
    .type {
        display: none;
    }
}
</style>
