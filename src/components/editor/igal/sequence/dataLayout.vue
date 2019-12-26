<template>
    <div v-if="Array.isArray(data)">
        <div
            class="data"
            v-for="(item, index) of data"
            :key="index"
            :Index.prop="index"
        >
            <template>{{ item }}</template>
        </div>
    </div>
    <div v-else>
        <div class="data">{{ data }}</div>
    </div>
</template>

<script>
export default {
    props: ['data'],
}
</script>

<style lang="scss" scoped>
.data {
    min-height: var(--line-height);
    white-space: pre-wrap;
}
</style>
