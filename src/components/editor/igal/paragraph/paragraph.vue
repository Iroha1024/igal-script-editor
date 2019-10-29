<template>
    <div class="paragraph">
        <header v-show="showHeader">
            <div class="hide-mark">{{ Mark.header_start }}</div>
            <div v-for="(item, index) of content.header" :key="'header' + index">{{ item }}</div>
            <div class="hide-mark">{{ Mark.header_end }}</div>
        </header>
        <main contenteditable="true" ref="main">
            <component v-for="(item, index) of main" :key="'main' + index" :is="checkType(item)" :info="item"></component>
        </main>
        <footer v-show="showFooter">
            <div class="hide-mark">{{ Mark.footer_start }}</div>
            <div v-for="(item, index) of content.footer" :key="'footer' + index">{{ item }}</div>
            <div class="hide-mark">{{ Mark.footer_end }}</div>
        </footer>
    </div>
</template>

<script>
import Mousetrap from 'mousetrap'

import Mark from 'utils/mark'
import sentence from './sentence'
import lineFeed from './lineFeed'

export default {
    data() {
        return {
            Mark: Object,
            showHeader: true,
            showFooter: true,
            // showHeader: false,
            // showFooter: false,
            main: [],
        }
    },
    props: {
        content: Object,
    },
    components: {
        sentence,
        lineFeed,
    },
    created() {
        // console.log(this.content.main);
        this.Mark = Mark
        this.main = this.content.main
        console.log(this.main);
    },
    mounted() {
        let mousetrap = new Mousetrap(this.$refs.main)
        mousetrap.bind('enter', event => {
            event.preventDefault()
            // let node = window.getSelection().focusNode.parentNode.parentNode
            // let parent = node.parentNode
            // let position = Array.from(parent.children).indexOf(node)
            // let arr = this.main.splice(position + 1)
            // console.log(parent.children, position + 1, parent.children[position + 1]);
            // this.main = [...this.main, 'a', ...arr]
            // let range = document.createRange()
            // range.setStart(parent.children[position + 1], 0)
        })
        mousetrap.bind('shift+enter', event => {
            event.preventDefault()
            document.execCommand('insertHTML', false, '<br class="br">')
        })
        // mousetrap.bind('backspace', event => {
        //     event.preventDefault()
        //     // console.log(this.content.main);
        //     console.log('delete');
        // })
        
    },
    methods: {
        checkType(str) {
            if (str === '') return 'lineFeed'
            if (str[0].name.includes('>')) return 'sentence'
        },
    },
}
</script>

<style lang="scss" scoped>
    .paragraph {
        .hide-mark {
            display: none;
        }
        main {
            outline: none;
        }
    }
</style>
