<template>
    <div class="igal" ref="igal">
        <composition-map
            :echarts="echarts"
            v-show="showEcharts"
        ></composition-map>
        <echart-button
            class="show"
            @click.native="showEcharts = !showEcharts"
        ></echart-button>
        <linked-sequence
            :linked="linked"
            :computedTitle="computedTitle"
        ></linked-sequence>
        <unlinked-sequence
            :unlinked="unlinked"
            :computedTitle="computedTitle"
        ></unlinked-sequence>
    </div>
</template>

<script>
import fs from 'fs'

import { mapState } from 'vuex'

import compositionMap from './echarts/compositionMap'
import echartButton from '@/components/button/echart-button'
import LinkedSequence from './LinkedSequence/'
import unlinkedSequence from './unlinkedSequence/'

import readIgalSync, { extraOperate } from '@/utils/igal/readIgal'
import saveIgal from '@/utils/igal/saveIgal'
import Type from '@/utils/shortcutKey'
import createSequence from '@/utils/sequence/createSequence'
import Mousetrap from '@/utils/Mousetrap'

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
    computed: {
        ...mapState({
            configPath: state => state.project.configPath
        }),
    },
    props: {
        path: String,
    },
    components: {
        compositionMap,
        echartButton,
        LinkedSequence,
        unlinkedSequence,
    },
    provide() {
        return {
            save: this.save,
            list: this.list,
        }
    },
    created() {
        readIgalSync(this.path, this.list, this.configPath)
        extraOperate(this.list, this.linked, this.unlinked, this.echarts)
    },
    mounted() {
        this.bindKeyEvent()
    },
    methods: {
        //保存文件后，更新uuids
        async save() {
            this.updateData()
            console.log(this.list)
            await saveIgal(this.list, this.path)
            this.$store.dispatch('updateUuids')
        },
        //更新状态
        updateData() {
            this.clearRank()
            this.linked = []
            this.unlinked = []
            this.echarts = {
                data: [],
                links: [],
            }
            extraOperate(this.list, this.linked, this.unlinked, this.echarts)
        },
        //消除所有sequence层级rank
        clearRank() {
            this.list.forEach(sequence => {
                this.$delete(sequence, 'rank')
            })
        },
        computedTitle(sequence) {
            const title = sequence.customized.title
            const uuid = sequence.uuid
            if (title) {
                return `${title} --> ${uuid}`
            }
            return uuid
        },
        //按键绑定
        bindKeyEvent() {
            Mousetrap(this.$refs['igal']).bind(Type.insertSequence, event => {
                event.preventDefault()
                this.insertSequence()
            })
        },
        //shift+insert插入新的序列
        async insertSequence() {
            const sequence = await createSequence(this.configPath)
            this.list.push(sequence)
            this.updateData()
        },
    },
}
</script>

<style lang="scss" scoped>
.igal {
    min-height: 100%;
    height: inherit;
    padding: 20px;
    line-height: 1.4;
    word-break: break-all;
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
