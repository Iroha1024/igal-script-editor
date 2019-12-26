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
                focusOffset: null,
                //初始光标所在偏移
                anchorOffset: null,
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
                focusOffset: null,
                anchorOffset: null,
            }
            this.selection.index = index
            this.selection.key = key
            this.selection.target = target
            const selection = window.getSelection()
            this.selection.focusOffset = selection.focusOffset
            this.selection.anchorOffset = selection.anchorOffset
            console.log(this.selection, selection)
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
            /**
             * 获取插入后值
             * @param {string} value 所在文本节点值
             * @param {string} str 插入值
             * @param {number} focusOffset 光标所在偏移
             * @param {number} anchorOffset 初始光标所在偏移
             */
            function insertStr(value, str, focusOffset, anchorOffset) {
                if (focusOffset <= anchorOffset) {
                    return {
                        result:
                            value.slice(0, focusOffset) +
                            str +
                            value.slice(anchorOffset),
                        offset: focusOffset + 1,
                    }
                } else {
                    return {
                        result:
                            value.slice(0, anchorOffset) +
                            str +
                            value.slice(focusOffset),
                        offset: anchorOffset + 1,
                    }
                }
            }
            /**
             * 为sequence.data赋值
             * @param {object} selection 拖蓝区域
             * @param {string} str 插入值
             * @param {string} value 所在文本节点值
             */
            const changeState = (
                { target, key, index, focusOffset, anchorOffset },
                value,
                str
            ) => {
                let result, offset
                if (str) {
                    ;({ result, offset } = insertStr(
                        value,
                        str,
                        focusOffset,
                        anchorOffset
                    ))
                } else {
                    ;({ result, offset } = deleteStr(
                        value,
                        focusOffset,
                        anchorOffset
                    ))
                }
                if (index !== null && index !== undefined) {
                    this.$set(target[key], index, result)
                } else {
                    target[key] = result
                }
                setTimeout(() => {
                    const selection = window.getSelection()
                    let node = selection.focusNode
                    if (node.firstChild) {
                        node = node.firstChild
                    }
                    const range = selection.getRangeAt(0)
                    range.setStart(node, offset)
                    this.selection.anchorOffset = offset
                    this.selection.focusOffset = offset
                }, 0)
            }
            function isBackspace(key) {
                return key === 'Backspace'
            }
            /**
             * 获取删除后值
             * @param {string} value 所在文本节点值
             * @param {number} focusOffset 光标所在偏移
             * @param {number} anchorOffset 初始光标所在偏移
             */
            function deleteStr(value, focusOffset, anchorOffset) {
                if (focusOffset < anchorOffset) {
                    return {
                        result:
                            value.slice(0, focusOffset) +
                            value.slice(anchorOffset),
                        offset: focusOffset,
                    }
                } else if (focusOffset > anchorOffset) {
                    return {
                        result:
                            value.slice(0, anchorOffset) +
                            value.slice(focusOffset),
                        offset: anchorOffset,
                    }
                } else {
                    return {
                        result:
                            value.slice(0, focusOffset - 1) +
                            value.slice(focusOffset),
                        offset: focusOffset - 1,
                    }
                }
            }
            console.log(this.selection);
            const selection = this.selection,
                value =
                    selection.target[selection.key][selection.index] ||
                    selection.target[selection.key]
            switch (true) {
                //方向键
                case isDirectionKey(event.key):
                    setTimeout(() => {
                        const node = window.getSelection().focusNode
                        this.getTarget(node)
                        console.log(this.selection)
                    }, 0)
                    break
                //输入当个字符，且非命令，e.g. ctrl+z
                case isSingleKey(event.key) && !isCommand(event):
                    event.preventDefault()
                    const str = event.key
                    changeState(selection, value, str)
                    break
                //删除字符
                case isBackspace(event.key):
                    event.preventDefault()
                    const sel = window.getSelection()
                    //当刷蓝区域不在同一节点上，或在节点开头时，不能删除
                    const canNotBeDelete =
                        sel.anchorNode !== sel.focusNode ||
                        (sel.isCollapsed && sel.focusOffset === 0)
                    if (canNotBeDelete) return
                    changeState(selection, value)
                    break
                default:
                    // console.log(event)
                    console.log(window.getSelection());
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
