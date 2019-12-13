<template>
    <div class="unlinked-sequence">
        <sequence
            v-for="(sequence, index) of unlinked"
            class="unlinked"
            :key="index"
            :sequence="sequence"
        ></sequence>
    </div>
</template>

<script>
import sequence from '../sequence/sequence'

export default {
    props: {
        unlinked: Array,
        uuid: Array,
    },
    components: {
        sequence,
    },
}
</script>

<style lang="scss" scoped>
/deep/ .unlinked .title {
    background: #fc7171 !important;
}
</style>
