<template>
    <div class="editor" contenteditable="true">
        {{ content }}
    </div>
</template>

<script>
import fs from 'fs'

export default {
    data() {
        return {
            content: ''
        }
    },
    props: {
        path: String,
    },
    created() {
        this.getContent()
    },
    methods: {
        getContent() {
            this.content = fs.readFileSync(this.path, 'utf-8')
            // console.log(this.path, this.content);
        }
    },
}
</script>

<style lang="scss" scoped>
    .editor {
        flex: 1;
        padding: 20px;
    }
</style>
