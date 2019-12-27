<template>
    <div class="sequence" ref="sequence">
        <header>
            <customized-info
                :customized="sequence.customized"
            ></customized-info>
        </header>
        <main>
            <component
                :is="item.type"
                v-for="(item, index) of sequence.data"
                :key="index"
                :info="item"
            ></component>
        </main>
        <footer>
            <button-area :sequence="sequence"></button-area>
        </footer>
    </div>
</template>

<script>
import customizedInfo from './header/customizedInfo'
import sentence from './main/sentence'
import linebreak from './main/linebreak'
import branch from './main/branch'
import buttonArea from './footer/buttonArea'

import { Type } from '@/utils/sequence/mark.js'

export default {
    props: {
        sequence: Object,
    },
    components: {
        customizedInfo,
        sentence,
        linebreak,
        branch,
        buttonArea,
    },
    provide() {
        return {
            sequence: this.sequence,
            getNode: this.getNode,
        }
    },
    methods: {
        getNode(index) {
            const main = this.$refs.sequence.children[1]
            return main.children[index]
        }
    },
}
</script>

<style lang="scss" scoped>
.sequence {
    background-color: #ebebeb91;
    border-radius: 0 0 10px 10px;
    padding: $sequence-padding;
    margin-bottom: 20px;
}
</style>
