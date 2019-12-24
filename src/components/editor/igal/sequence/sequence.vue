<template>
    <div
        class="sequence"
        contenteditable="true"
        @click="getTarget($event)"
        @keydown="keydown($event)"
    >
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
    data() {
        return {
            //点击处数据
            selection: {
                //sequence原数据
                target: null,
                key: null,
                //若为数组，则存在index值
                index: null,
                //当前值
                value: null,
                //光标所在偏移
                offset: null,
            },
        }
    },
    inject: ['list'],
    methods: {
        getTarget(event) {
            let node = event.target
            let index, key, target
            try {
                while (node && !node.Target) {
                    if (node.Index !== null && node.Index !== undefined) {
                        index = node.Index
                    }
                    if (node.Key) {
                        key = node.Key
                    }
                    node = node.parentNode
                }
                target = node.Target
            } catch (error) {
                //footer区域报错退出
                return
            }
            //customized-info--key区域退出
            if (target.type !== 'linebreak' && !key) return
            this.selection = {
                target: null,
                key: null,
                index: null,
                value: null,
            }
            this.selection.index = index
            this.selection.key = key
            this.selection.target = target
            const selection = window.getSelection()
            this.selection.offset = selection.focusOffset
            if (key) {
                this.selection.value = target[key][index] || target[key]
            }
            console.log(this.selection)
        },
        keydown(event) {
            const value = event.key
            console.log(this.list)
        },
    },
}
</script>

<style lang="scss" scoped>
.sequence {
    background-color: #ebebeb91;
    border-radius: 0 0 10px 10px;
    padding: $sequence-padding;
    margin-bottom: 20px;
    outline: none;
}
</style>
