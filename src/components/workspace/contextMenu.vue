<template>
    <div class="context-menu" ref="contextMenu">
        <div v-show="isShow(show.openDir)" class="menu-item" ref="openDir">
            打开文件夹
        </div>
        <div
            v-show="isShow(show.createFile)"
            class="menu-item"
            ref="createFile"
        >
            新建文件
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'

import eventBus from '@/eventBus'

export default {
    data() {
        return {
            //右键点击区域id
            currentWindow: null,
            //文件路径
            path: '',
            show: {
                openDir: ['resizeDrag'],
                createFile: ['dir'],
            },
        }
    },
    computed: {
        ...mapState(['files']),
    },
    mounted() {
        this.openMenu()
        this.bindEvent()
    },
    methods: {
        isShow(arr) {
            return arr.includes(this.currentWindow)
        },
        //右键菜单栏
        openMenu() {
            const contextMenu = this.$refs.contextMenu
            const viewPortWidth = document.documentElement.clientWidth
            const viewPortHeight = document.documentElement.clientHeight
            const width = parseInt(contextMenu.offsetWidth)
            const height = parseInt(contextMenu.offsetHeight)
            window.addEventListener('contextmenu', event => {
                this.currentWindow = event.target.id
                this.path = event.target.getAttribute('path')
                // console.log(this.currentWindow, this.path);
                contextMenu.style.visibility = 'visible'
                contextMenu.style.top = event.clientY + 'px'
                contextMenu.style.left = event.clientX + 'px'
                if (event.clientX + width > viewPortWidth) {
                    contextMenu.style.left = event.clientX - width + 'px'
                }
                if (event.clientY + height > viewPortHeight) {
                    contextMenu.style.top = event.clientY - height + 'px'
                }
            })
            window.addEventListener('click', () => {
                contextMenu.style.visibility = 'hidden'
            })
        },
        //菜单栏事件绑定
        bindEvent() {
            this.openDirectory()
            this.createFile()
        },
        //打开文件夹
        openDirectory() {
            this.$refs.openDir.addEventListener('click', () => {
                ipcRenderer.send('open-directory-dialog')
            })
        },
        //递归遍历files，找到所选文件夹所在数组
        findDirOfArr(arr) {
            for (const file of arr) {
                if (file.path === this.path) return arr
                if (Array.isArray(file)) {
                    return this.findDirOfArr(file)
                }
            }
        },
        //新建文件
        createFile() {
            this.$refs.createFile.addEventListener('click', () => {
                const arr = this.findDirOfArr(this.files)
                let file = {
                    name: '',
                    path: this.path,
                    type: 'file',
                    isShowInput: true,
                }
                arr.push(file)
                this.$store.commit('setFiles', this.files)
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.context-menu {
    width: 150px;
    width: fit-content;
    visibility: hidden;
    position: absolute;
    font-size: 18px;
    background-color: #fff;
    border-radius: 5px;
    z-index: 100;
    background-color: #9e9ead;
    .menu-item {
        padding: 10px 20px;
        &:hover {
            cursor: pointer;
            background-color: $nomral-button-color;
        }
    }
    .menu-item + .menu-item {
        border-top: 1px solid #ccc;
    }
}
</style>
