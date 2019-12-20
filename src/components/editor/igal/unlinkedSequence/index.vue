<template>
    <div class="unlinked-sequence">
        <div v-for="(sequence, index) of unlinked" :key="index">
            <div class="title">
                {{ computedTitle(sequence) }}
            </div>
            <sequence class="unlinked" :sequence="sequence"></sequence>
        </div>
    </div>
</template>

<script>
import sequence from '../sequence/sequence'

export default {
    props: {
        unlinked: Array,
        computedTitle: Function,
    },
    components: {
        sequence,
    },
}
</script>

<style lang="scss" scoped>
.title {
    border-radius: 10px 10px 0 0;
    padding: 0 $sequence-padding;
    font-size: 20px;
    background-color: #fc7171;
}
</style>
