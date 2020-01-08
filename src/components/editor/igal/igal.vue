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
import { debounce } from 'lodash'

import compositionMap from './echarts/compositionMap'
import echartButton from '@/components/button/echart-button'
import LinkedSequence from './LinkedSequence/'
import unlinkedSequence from './unlinkedSequence/'

import readIgalSync, { extraOperate } from '@/utils/igal/readIgal'
import saveIgal from '@/utils/igal/saveIgal'
import Type from '@/utils/shortcutKey'
import createSequence, { calcSize } from '@/utils/sequence/createSequence'
import Mousetrap from '@/utils/Mousetrap'
import { findFileByPath } from '@/utils/fileManage/findOrigin'

export default {
    data() {
        return {
            igal: {
                list: [],
            },
            list: [],
            linked: [],
            unlinked: [],
            echarts: {
                data: [],
                links: [],
            },
            showEcharts: false,
            fontSize: document.documentElement.style.getPropertyValue(
                '--font-size'
            ),
            domToSequence: new Map(),
        }
    },
    computed: {
        ...mapState({
            configPath: state => state.project.configPath,
            initIgalData: state => state.project.initIgalData,
            files: state => state.fileManage.files,
            configData: state => state.program.configData,
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
            igal: this.igal,
            setDomToSequence: this.setDomToSequence,
            deleteSequenceRef: this.deleteSequenceRef,
            focusLine: this.focusLine,
        }
    },
    created() {
        this.getIgal()
    },
    mounted() {
        this.bindKeyEvent()
    },
    watch: {
        configData(newVal) {
            const fontSize = `${newVal.fontSize.value}px`
            //当font-size更新后，重新计算每行行高
            if (fontSize !== this.fontSize) {
                this.setSequenceChildSize()
                this.fontSize = fontSize
            }
        },
    },
    methods: {
        setDomToSequence(dom, sequence) {
            this.domToSequence.set(dom, sequence)
        },
        deleteSequenceRef(dom) {
            this.domToSequence.delete(dom)
        },
        //为每个sequence子组件设置行高
        setSequenceChildSize() {
            const size = calcSize()
            this.list.forEach(sequence => {
                sequence.data.forEach(line => {
                    line.size = line.MAX_LINE * size
                })
            })
        },
        //读取igal文件
        getIgal() {
            this.list = this.initIgalData.get(this.path)
            if (!this.list) {
                this.list = []
                readIgalSync(this.path, this.list, this.configPath)
            }
            this.setSequenceChildSize()
            this.igal.list = this.list
            extraOperate(this.list, this.linked, this.unlinked, this.echarts)
        },
        //保存文件后，更新uuids
        async save() {
            this.updateData()
            console.log(this.list)
            await saveIgal(this.list, this.path)
            this.updateUuids()
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
        updateUuids() {
            const file = findFileByPath(this.files, this.path)
            const uuids = this.list.map(sequence => sequence.uuid)
            this.$store.dispatch('updateUuids', { file, uuids })
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
            const igal = this.$refs.igal
            this.insertSequence(igal)
            this.deleteSequence(igal)
        },
        getDomBySequence(sequence) {
            for (const [dom, instance] of [...this.domToSequence]) {
                if (instance.sequence === sequence) {
                    return dom
                }
            }
        },
        getDomByRank(sequence) {
            if (!sequence.hasOwnProperty('rank')) return
            for (const [dom, inst] of [...this.domToSequence]) {
                if (inst.sequence.rank === sequence.rank) {
                    return dom
                }
            }
        },
        //shift+insert插入新的序列（1s防抖），连通新序列
        insertSequence(igal) {
            const insert = debounce(
                async () => {
                    const dom = event.path.find(dom => dom.className === 'sequence')
                    const instance = this.domToSequence.get(dom)
                    const sequence = await createSequence(this.configPath)
                    this.list.push(sequence)
                    instance.sequence.next.push(sequence.uuid)
                    this.updateData()
                    this.$nextTick(() => {
                        const dom = this.getDomBySequence(sequence)
                        this.focus(dom)
                    })
                },
                1000,
                {
                    leading: true,
                    trailing: false,
                }
            )
            Mousetrap(igal).bind(Type.insertSequence, event => {
                event.preventDefault()
                insert()
            })
        },
        //ctrl+shift+d删除序列
        deleteSequence(igal) {
            Mousetrap(igal).bind(Type.deleteSequence, event => {
                event.preventDefault()
                //单序列，无法删除
                if (this.list.length === 1) return
                const dom = event.path.find(dom => dom.className === 'sequence')
                const instance = this.domToSequence.get(dom)
                const { sequence } = instance
                const index = this.list.indexOf(sequence)
                this.list.splice(index, 1)
                this.updateData()
                this.$nextTick(() => {
                    //找同级rank的dom
                    let sequenceDom = this.getDomByRank(sequence)
                    if (!sequenceDom) {
                        //若无，找上一个sequence的同级rank，有则选active激活dom，无则取focusSequence
                        let focusSequence = this.list[index - 1]
                        const sameRankList = this.list.filter(
                            sequence =>
                                focusSequence.hasOwnProperty('rank') &&
                                sequence.rank === focusSequence.rank
                        )
                        if (sameRankList.length > 1) {
                            focusSequence = sameRankList.find(
                                sequence => sequence.active
                            )
                        }
                        sequenceDom = this.getDomBySequence(focusSequence)
                    }
                    // console.log(sequence.uuid)
                    this.focus(sequenceDom)
                })
            })
        },
        focus(dom) {
            function getFocusNode(node) {
                if (node.contentEditable === 'true') {
                    return node
                } else {
                    for (const item of node.children) {
                        const focusNode = getFocusNode(item)
                        if (focusNode) return focusNode
                    }
                }
            }
            this.focusLine(dom, getFocusNode, {
                block: 'center',
                behavior: 'smooth',
            })
        },
        /**
         * @param {HTMLElement} dom 需聚焦的dom
         * @param {Function} getFocusNode 在dom内寻找最终聚焦节点的方法
         * @param {Object | Boolean} scrollOption 滑动配置
         */
        focusLine(dom, getFocusNode, scrollOption) {
            const selection = window.getSelection()
            selection.removeAllRanges()
            const range = document.createRange()
            let node = getFocusNode(dom)
            if (node.textContent) {
                const index = node.textContent.length
                range.setStart(node.firstChild, index)
            } else {
                range.setStart(node, 0)
            }
            selection.addRange(range)
            node.scrollIntoView(scrollOption)
        },
    },
}
</script>

<style lang="scss" scoped>
.igal {
    min-height: 100%;
    height: inherit;
    padding: 20px;
    line-height: var(--line-height);
    word-break: break-all;
    box-sizing: border-box;
    .show {
        z-index: 103;
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
