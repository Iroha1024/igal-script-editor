<template>
    <div class="branch">
        <div class="question">{{ info.question }}</div>
        <div class="choices">
            <div v-for="(item, index) of info.choices">{{ item }}</div>
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

<style lang="scss" scoped></style>
