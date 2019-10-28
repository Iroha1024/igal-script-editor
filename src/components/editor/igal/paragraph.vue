<template>
    <div class="paragraph">
        <header v-show="showHeader">
            <div v-for="(item, index) of content.header" :key="'header' + index">
                {{ item }}
            </div>
        </header>
        <main contenteditable="true" ref="main">
            <div class="row" v-for="(item, index) of content.main" :key="'main' + index">
                <template v-if="item">
                    <span class="name">{{ item.split(' ')[0] }}</span>
                    <span class="text">{{ item.split(' ')[1] }}</span>
                </template>
                <br v-else>
            </div>
        </main>
        <footer v-show="showFooter">
            <div v-for="(item, index) of content.footer" :key="'footer' + index">
                {{ item }}
            </div>
        </footer>
    </div>
</template>

<script>
import Mousetrap from 'mousetrap'

export default {
    data() {
        return {
            // showHeader: true,
            // showFooter: true,
            showHeader: false,
            showFooter: false,

        }
    },
    props: {
        content: Object,
    },
    created() {
        // console.log(this.content.main);
    },
    mounted() {
        let mousetrap = new Mousetrap(this.$refs.main)
        mousetrap.bind('enter', event => {
            event.preventDefault()
            // console.log(this.content.main);
        })
        
    },
}
</script>

<style lang="scss" scoped>
    main {
        outline: none;
        .row {
            .name {
                vertical-align: top;
                display: inline-block;
            }
            .text {
                display: inline-block;
            }
        }
    }
</style>
