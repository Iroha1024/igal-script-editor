<template>
    <div class="workspace">
        <file-manage></file-manage>
        <keep-alive>
            <router-view :key="$route.path"></router-view>
        </keep-alive>
    </div>
</template>

<script>
import fileManage from '@/components/workspace/fileManage'
export default {
    components: {
        fileManage,
    },
}
</script>

<style lang="scss" scoped>
.workspace {
    display: flex;
    height: inherit;
    overflow: hidden;
}
</style>
