<template>
    <div class="igal" ref="igal" contenteditable="true">
        <composition-map
            :echarts="echarts"
            v-show="showEcharts"
        ></composition-map>
        <echart-button
            class="show"
            @click.native="showEcharts = !showEcharts"
            contenteditable="false"
        ></echart-button>
        <sequence
            v-for="(item, index) of list"
            :key="item.uuid"
            :sequence="item"
        ></sequence>
    </div>
</template>

<script>
import fs from 'fs'

import sequence from './sequence/sequence'
import compositionMap from './echarts/compositionMap'
import echartButton from '@/components/button/echart-button'

import Type from '@/utils/shortcutKey'
import readIgal, { extraOperate } from '@/utils/readIgal'
import saveIgal from '@/utils/saveIgal'

export default {
    data() {
        return {
            list: [],
            linked: [],
            unlinked: [],
            echarts: {
                data: [],
                links: [],
            },
            showEcharts: false,
        }
    },
    props: {
        path: String,
    },
    components: {
        sequence,
        compositionMap,
        echartButton,
    },
    created() {
        readIgal(this.path, this.list, this.$store.state.configPath)
        // console.log(this.$store.state.dirPath, this.$store.state.configPath);
        // console.log(this.list)
        extraOperate(this.list, this.linked, this.unlinked, this.echarts)
        this.save()
    },
    methods: {
        save() {
            this.$on(Type.save, () => {
                console.log(this.list)
                saveIgal(this.list, this.path)
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.igal {
    min-height: 100%;
    height: inherit;
    padding: 20px;
    line-height: 30px;
    word-break: break-all;
    outline: none;
    box-sizing: border-box;
    .show {
        z-index: 101;
        position: fixed;
        right: 40px;
        top: 50px;
        $width: 50px;
        font-size: 40px;
        color: $nomral-button-color;
        @include button(transparent, $width, transparent);
        transition: all 0.5s;
        &:hover {
            transform: scale(1.5);
        }
    }
}
</style>
