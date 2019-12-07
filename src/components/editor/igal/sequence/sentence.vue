<template>
    <div class="sentence">
        <div class="name">{{ info.name }}</div>
        <div class="text">
            <p v-for="(item, index) of info.text" :key="index">{{ item }}</p>
        </div>
        <div class="remark">
            <p v-for="(item, index) of info.remark" :key="index">{{ item }}</p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        info: Object,
    },
}
</script>

<style lang="scss" scoped>
.sentence {
    display: flex;
    .name {
        flex: 0 0 20%;
    }
    .text {
        flex: 0 0 40%;
    }
}
</style>
