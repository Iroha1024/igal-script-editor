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
    </div>
</template>

<script>
import fs from 'fs'

import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'

import { readDir } from '@/utils/readIgal'
import { findArrOfDir, findFileByPath, findArrOfArr } from '@/utils/findOrigin'
import toggleDirShow from '@/utils/toggleDirShow'

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
            window.addEventListener('contextmenu', event => {
                //获取指定区域id和path
                this.currentWindow = event.target.id
                this.path = event.target.getAttribute('path')
                const viewPortWidth = document.documentElement.clientWidth
                const viewPortHeight = document.documentElement.clientHeight
                contextMenu.style.display = 'block'
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
                }, 0)
            })
            window.addEventListener('click', () => {
                contextMenu.style.display = 'none'
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
                    path: `${this.path}\\`,
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
                this.$store.commit('setFile', file)
            })
        },
        //删除文件
        delteFile() {
            this.$refs.delteFile.addEventListener('click', () => {
                const file = findFileByPath(this.files, this.path)
                const arr = findArrOfDir(this.files, this.path)
                arr.splice(arr.indexOf(file), 1)
                fs.unlink(file.path, err => {})
            })
        },
        //删除文件夹
        delteDir() {
            function deleteFile(path) {
                return new Promise((resolve, reject) => {
                    fs.unlink(path, err => {
                        if (err) return reject()
                        resolve()
                    })
                })
            }
            function deleteFolder(path) {
                return new Promise((resolve, reject) => {
                    fs.rmdir(path, err => {
                        if (err) return reject()
                        resolve()
                    })
                })
            }
            function stat(path, files) {
                const promiseList = []
                return new Promise((resolve, reject) => {
                    files.forEach(file => {
                        const promise = new Promise((resolve, reject) => {
                            fs.stat(`${path}\\${file}`, (err, stats) => {
                                if (err) return reject()
                                if (stats.isDirectory()) {
                                    deleteFolderRecursively(
                                        `${path}\\${file}`
                                    ).then(() => {
                                        deleteFolder(`${path}\\${file}`).then(
                                            () => {
                                                resolve()
                                            }
                                        )
                                    })
                                } else {
                                    deleteFile(`${path}\\${file}`).then(() => {
                                        resolve()
                                    })
                                }
                            })
                        })
                        promiseList.push(promise)
                    })
                    Promise.all(promiseList).then(() => {
                        resolve()
                    })
                })
            }
            //递归删除文件夹
            const deleteFolderRecursively = async dirPath => {
                const files = await readDir(dirPath)
                await stat(dirPath, files)
            }
            this.$refs.delteDir.addEventListener('click', () => {
                const arr = findArrOfDir(this.files, this.path)
                const outerArr = findArrOfArr(arr, this.files)
                if (this.flies === outerArr) {
                    this.$store.commit('setFiles', [])
                } else {
                    outerArr.splice(outerArr.indexOf(arr), 1)
                }
                deleteFolderRecursively(this.path).then(() => {
                    deleteFolder(this.path)
                })
            })
        },
        //新增文件夹
        createDir() {
            this.$refs.createDir.addEventListener('click', () => {
                const arr = findArrOfDir(this.files, this.path)
                const dir = {
                    name: '',
                    path: `${this.path}\\`,
                    type: 'dir',
                    isEdit: true,
                    isNewBuilt: true,
                }
                arr.push([dir])
                this.$store.commit('setDir', dir)
                this.$store.commit('setChosen', dir)
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.context-menu {
    width: 150px;
    width: fit-content;
    display: none;
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
