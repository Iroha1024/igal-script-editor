<template>
    <div class="workspace">
        <file-manage></file-manage>
        <keep-alive>
            <router-view :key="$route.path"></router-view>
        </keep-alive>
        <context-menu></context-menu>
    </div>
</template>

<script>
import fileManage from '@/components/workspace/fileManage'
import contextMenu from '@/components/workspace/contextMenu'

export default {
    components: {
        fileManage,
        contextMenu,
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
