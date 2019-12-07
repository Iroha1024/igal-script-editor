<template>
    <div class="igal" ref="igal" contenteditable="true">
        <composition-map
            :echarts="echarts"
            v-show="showEcharts"
        ></composition-map>
        <div
            class="show"
            @click="showEcharts = !showEcharts"
            contenteditable="false"
        >
            E
        </div>
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

import Type from '@/utils/shortcutKey'
import readIgal, { extraOperate } from '@/utils/readIgal'

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
            showEcharts: true,
        }
    },
    props: {
        path: String,
    },
    components: {
        sequence,
        compositionMap,
    },
    created() {
        readIgal(this.path, this.list)
        // console.log(this.$store.state.dirPath, this.$store.state.configPath);
        extraOperate(this.list, this.linked, this.unlinked, this.echarts)
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
    .show {
        $width: 50px;
        position: fixed;
        right: 40px;
        top: 50px;
        width: $width;
        height: $width;
        line-height: $width;
        border-radius: $width / 2;
        background: #61a7f1;
        user-select: none;
        text-align: center;
        &:hover {
            cursor: pointer;
            background: #46f88e;
        }
    }
}
</style>
