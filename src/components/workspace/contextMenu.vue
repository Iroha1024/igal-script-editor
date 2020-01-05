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
        <div v-show="isShow(show.delteFile)" class="menu-item" ref="delteFile">
            删除文件
        </div>
        <div v-show="isShow(show.delteDir)" class="menu-item" ref="delteDir">
            删除文件夹
        </div>
        <div
            v-show="isShow(show.createDir)"
            class="menu-item"
            ref="createDir"
            id="createDir"
        >
            新增文件夹
        </div>
        <div
            v-show="isShow(show.showItemInFolder)"
            class="menu-item"
            ref="showItemInFolder"
        >
            显示位置
        </div>
    </div>
</template>

<script>
import fs from 'fs'
import Path from 'path'

import { ipcRenderer, shell } from 'electron'
import { mapState } from 'vuex'

import {
    findArrOfDir,
    findFileByPath,
    findArrOfArr,
} from '@/utils/fileManage/findOrigin'
import toggleDirShow from '@/utils/fileManage/toggleDirShow'

export default {
    data() {
        return {
            //右键点击区域id
            currentWindow: null,
            //右键点击文件路径
            path: '',
            //功能只在相应id区域出现
            show: {
                openDir: ['resizeDrag'],
                createFile: ['dir'],
                rename: ['file', 'dir'],
                delteFile: ['file'],
                delteDir: ['dir'],
                createDir: ['dir'],
                showItemInFolder: ['file', 'dir'],
            },
        }
    },
    computed: {
        ...mapState({
            files: state => state.fileManage.files,
        }),
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
            window.addEventListener('contextmenu', event => {
                //获取指定区域id和path
                this.currentWindow = event.target.id
                this.path = event.target.getAttribute('path')
                const viewPortWidth = document.documentElement.clientWidth
                const viewPortHeight = document.documentElement.clientHeight
                setTimeout(() => {
                    const width = contextMenu.offsetWidth
                    const height = contextMenu.offsetHeight
                    contextMenu.style.top = event.clientY + 'px'
                    contextMenu.style.left = event.clientX + 'px'
                    if (event.clientX + width > viewPortWidth) {
                        contextMenu.style.left = event.clientX - width + 'px'
                    }
                    if (event.clientY + height > viewPortHeight) {
                        contextMenu.style.top = event.clientY - height + 'px'
                    }
                    contextMenu.style.visibility = 'visible'
                }, 0)
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
            this.delteFile()
            this.delteDir()
            this.createDir()
            this.showItemInFolder()
        },
        //打开文件夹
        openDirectory() {
            this.$refs.openDir.addEventListener('click', () => {
                ipcRenderer.send('open-directory-dialog')
            })
        },
        //新建文件
        createFile() {
            this.$refs.createFile.addEventListener('click', () => {
                const dir = findFileByPath(this.files, this.path)
                const arr = findArrOfDir(this.files, this.path)
                //如果创建文件时，文件夹折叠，自动打开
                if (dir.isFolded) {
                    toggleDirShow(dir, arr)
                }
                const file = {
                    name: '',
                    path: `${this.path}${Path.sep}`,
                    type: 'file',
                    isEdit: true,
                    isNewBuilt: true,
                }
                arr.push(file)
                this.$store.commit('setFile', file)
                this.$store.commit('setChosen', file)
            })
        },
        //重命名
        rename() {
            this.$refs.rename.addEventListener('click', () => {
                const file = findFileByPath(this.files, this.path)
                file.isEdit = true
                if (file.type === 'file') {
                    this.$store.commit('setFile', file)
                } else {
                    this.$store.commit('setDir', file)
                }
            })
        },
        //删除文件
        delteFile() {
            this.$refs.delteFile.addEventListener('click', () => {
                const file = findFileByPath(this.files, this.path)
                const arr = findArrOfDir(this.files, this.path)
                this.$store.dispatch('updateUuids', { file })
                arr.splice(arr.indexOf(file), 1)
                shell.moveItemToTrash(this.path)
            })
        },
        //删除文件夹
        delteDir() {
            this.$refs.delteDir.addEventListener('click', () => {
                const arr = findArrOfDir(this.files, this.path)
                const outerArr = findArrOfArr(arr, this.files)
                if (this.flies === outerArr) {
                    this.$store.commit('setFiles', [])
                } else {
                    outerArr.splice(outerArr.indexOf(arr), 1)
                }
                shell.moveItemToTrash(this.path)
            })
        },
        //新增文件夹
        createDir() {
            this.$refs.createDir.addEventListener('click', () => {
                const upperDir = findFileByPath(this.files, this.path)
                const arr = findArrOfDir(this.files, this.path)
                //如果创建文件夹时，文件夹折叠，自动打开
                if (upperDir.isFolded) {
                    toggleDirShow(upperDir, arr)
                }
                const dir = {
                    name: '',
                    path: `${this.path}${Path.sep}`,
                    type: 'dir',
                    isEdit: true,
                    isNewBuilt: true,
                }
                arr.push([dir])
                this.$store.commit('setDir', dir)
                this.$store.commit('setChosen', dir)
            })
        },
        //在文件资源管理器打开
        showItemInFolder() {
            this.$refs.showItemInFolder.addEventListener('click', () => {
                shell.showItemInFolder(this.path)
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
    background-color: #c3c6d3;
    user-select: none;
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
