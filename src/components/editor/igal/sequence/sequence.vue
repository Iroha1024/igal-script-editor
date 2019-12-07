<template>
    <div class="sequence">
        <header>
            <div class="uuid" contenteditable="false">{{ sequence.uuid }}</div>
            <div class="desc">{{ sequence.description }}</div>
        </header>
        <main>
            <component
                :is="item.type"
                v-for="(item, index) of data"
                :key="index"
                :info="item"
            ></component>
        </main>
        <footer></footer>
    </div>
</template>

<script>
import sentence from './sentence'
import linebreak from './linebreak'
import branch from './branch'

export default {
    props: {
        sequence: Object,
    },
    components: {
        sentence,
        linebreak,
        branch,
    },
    data() {
        return {
            data: this.sequence.data,
        }
    },
}
</script>

<style lang="scss" scoped>
.sequence {
    margin-bottom: 20px;
    header {
        .uuid {
            background: #ccc;
        }
    }
}
</style>
