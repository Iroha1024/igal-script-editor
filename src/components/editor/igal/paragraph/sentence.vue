<template>
    <div class="sentence">
        <span class="name">{{ name }}</span>
        <span class="text">
            <p v-for="(item, index) of text" :key="index">{{ item }}</p>
        </span>
    </div>
</template>

<script>
export default {
    data() {
        return {
            name: '',
            text: ''
        }
    },
    props: {
        info: Array
    },
    created() {
        this.name = this.info[0].name
        this.text = this.info[0].text
    },
}
</script>

<style lang="scss" scoped>
    .sentence {
        display: flex;
        // .name {
            // vertical-align: top;
            // display: inline-block;
        // }
        .text {
            flex: 1;
            // display: inline-block;
        }
    }
</style>
