<template>
    <div class="customized-info" :Target.prop="customized">
        <div
            class="customized-info__container"
            v-for="([key, value], index) of Object.entries(customized)"
        >
            <div class="customized-info--key" contenteditable="false">
                {{ key }}
            </div>
            <data-layout
                class="customized-info--value"
                :data="value"
                :Key.prop="key"
            ></data-layout>
        </div>
    </div>
</template>

<script>
import dataLayout from '../dataLayout'

export default {
    props: {
        customized: Object,
    },
    components: {
        dataLayout,
    },
}
</script>

<style lang="scss" scoped>
.customized-info__container {
    display: flex;
    .customized-info--key {
        flex: 0 0 20%;
        user-select: none;
    }
    .customized-info--value {
        flex: 1;
    }
}
</style>
