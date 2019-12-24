<template>
    <div class="line" :Target.prop="info">
        <br />
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
