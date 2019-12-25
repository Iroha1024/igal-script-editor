<template>
    <div
        class="sequence"
        contenteditable="true"
        @click="getTarget($event.target)"
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
                //光标所在偏移
                offset: null,
            },
        }
    },
    methods: {
        getTarget(node) {
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
                offset: null,
            }
            this.selection.index = index
            this.selection.key = key
            this.selection.target = target
            const selection = window.getSelection()
            this.selection.offset = selection.focusOffset
            console.log(this.selection)
        },
        keydown(event) {
            //上下左右，调整光标所在node
            function isDirectionKey(key) {
                return [
                    'ArrowUp',
                    'ArrowDown',
                    'ArrowLeft',
                    'ArrowRight',
                ].includes(key)
            }
            function isSingleKey(key) {
                return key.length === 1
            }
            function isCommand(event) {
                return event.altKey || event.ctrlKey
            }
            function insertKey(str, key, offset) {
                return str.slice(0, offset) + key + str.slice(offset)
            }
            function isBackspace(key) {
                return key === 'Backspace'
            }
            switch (true) {
                case isDirectionKey(event.key):
                    setTimeout(() => {
                        const node = window.getSelection().focusNode
                        this.getTarget(node)
                        console.log(this.selection)
                    }, 0)
                    break
                case isSingleKey(event.key) && !isCommand(event):
                    const key = event.key
                    const selection = this.selection
                    const value =
                        selection.target[selection.key][selection.index] ||
                        selection.target[selection.key]
                    if (
                        selection.index !== null &&
                        selection.index !== undefined
                    ) {
                        this.$set(
                            selection.target[selection.key],
                            selection.index,
                            insertKey(value, key, selection.offset)
                        )
                    } else {
                        selection.target[selection.key] = insertKey(
                            value,
                            key,
                            selection.offset
                        )
                    }
                    event.preventDefault()
                    setTimeout(() => {
                        const selection = window.getSelection()
                        let node = selection.focusNode
                        if (node.firstChild) {
                            node = node.firstChild
                        }
                        const range = selection.getRangeAt(0)
                        range.setStart(node, ++this.selection.offset)
                        // console.log(this.selection);
                    }, 0)
                    break
                case isBackspace(event.key):
                    event.preventDefault()
                    break
            }
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
