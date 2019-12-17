<template>
    <div class="context-menu" ref="contextMenu">
        <div v-show="isShow(show.openDir)" class="menu-item" ref="openDir">
            打开文件夹
        </div>
        <div
            v-show="isShow(show.createFile)"
            class="menu-item"
            ref="createFile"
            id="createFile"
        >
            新建文件
        </div>
        <div
            v-show="isShow(show.rename)"
            class="menu-item"
            ref="rename"
            id="rename"
        >
            重命名
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'

export default {
    data() {
        return {
            //右键点击区域id
            currentWindow: null,
            //文件路径
            path: '',
            //功能只在相应id区域出现
            show: {
                openDir: ['resizeDrag'],
                createFile: ['dir'],
                rename: ['file'],
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
        //右键菜单栏，获取指定区域id和path
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
            this.rename()
        },
        //打开文件夹
        openDirectory() {
            this.$refs.openDir.addEventListener('click', () => {
                ipcRenderer.send('open-directory-dialog')
            })
        },
        //递归遍历files，找到所选文件夹所在数组
        findDirOfArr(arr) {
            let list
            for (const file of arr) {
                if (file.path === this.path) return arr
                if (Array.isArray(file)) {
                    list = this.findDirOfArr(file)
                    if (list) return list
                }
            }
        },
        //递归遍历files，找到对应path文件
        findFileByPath(arr) {
            let file
            for (const item of arr) {
                if (item.path === this.path) return item
                if (Array.isArray(item)) {
                    file = this.findFileByPath(item)
                    if (file) return file
                }
            }
        },
        //新建文件
        createFile() {
            this.$refs.createFile.addEventListener('click', () => {
                const arr = this.findDirOfArr(this.files)
                const file = {
                    name: '',
                    path: this.path,
                    type: 'file',
                    isEdit: true,
                    isNewBuilt: true,
                }
                arr.push(file)
                this.$store.commit('setFile', file)
            })
        },
        //重命名
        rename() {
            this.$refs.rename.addEventListener('click', () => {
                const file = this.findFileByPath(this.files)
                file.isEdit = true
                this.$store.commit('setFile', file)
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
