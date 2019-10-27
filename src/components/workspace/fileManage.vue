<template>
    <div class="file-manage" ref="fileArea">
        <dir :files="files"></dir>
        <div class="context-menu" v-show="showMenu" ref="contextMenu">
            <div class="menu-item" ref="openDir">打开文件夹</div>
        </div>
        <div id="resize"></div>
    </div>
</template>

<script>
import { openDirectory } from '@/electron/renderer'
import { ipcRenderer } from 'electron'
import fs from 'fs'

import dir from '../fileManage/dir'

export default {
    data() {
        return {
            showMenu: false,
            files: []
        }
    },
    components: {
        dir
    },
    mounted() {
        this.bindEvent()
        this.getDirName()
        this.rigthClick()
        this.resize()
    },
    methods: {
        //菜单栏事件绑定
        bindEvent() {
            openDirectory(this.$refs.openDir)
        },
        //获取文件夹信息
        getDirName() {
            ipcRenderer.on('select-dir', (event, path) => {
                this.files = []
                let dirPath = path[0]
                if (dirPath) {
                    this.files.push({ path: dirPath, type: 'dir' })
                    this.getDirContents(dirPath, this.files)
                    // console.log(this.files);
                }
            })
        },
        // 获取文件夹内信息，传入files
        getDirContents(path, parent) {
            fs.readdirSync(path).forEach(file => {
                if (fs.statSync(`${path}\\${file}`).isDirectory()) {
                    let newParent = []
                    parent.push(newParent)
                    newParent.push({ path: `${path}\\${file}`, type: 'dir' })
                    this.getDirContents(`${path}\\${file}`, newParent)
                } else {
                    parent.push({ path: `${path}\\${file}`, type: 'file' })
                }
            })
        },
        //右键菜单栏
        rigthClick() {
            const fileArea = this.$refs.fileArea
            const contextMenu = this.$refs.contextMenu
            fileArea.addEventListener('contextmenu', event => {
                if (event.target !== event.currentTarget) return
                this.showMenu = true
                contextMenu.style.top = fileArea.scrollTop + event.pageY + 'px'
                contextMenu.style.left = `${event.pageX}px`
            })
            window.addEventListener('click', () => {
                this.showMenu = false
            })
        },
        //调整文件区大小
        resize() {
            const borderline = document.getElementById('resize')
            const fileArea = this.$refs.fileArea
            let dragging = false
            borderline.addEventListener('mousedown', () => {
                dragging = true
            })
            window.addEventListener('mousemove', event => {
                if (dragging) {
                    let width = fileArea.offsetWidth
                    fileArea.style.width = event.clientX + 'px'
                }
            })
            window.addEventListener('mouseup', () => {
                dragging = false
            })
        }
    },
}
</script>

<style lang="scss" scoped>
    $borderline-width: 10px;
    .file-manage {
        width: 250px;
        min-width: 200px;
        max-width: 400px;
        flex-shrink: 0;
        height: inherit;
        position: relative;
        background-color: #e9e9e9;
        box-sizing: border-box;
        padding: $borderline-width 2 * $borderline-width;
        overflow: hidden scroll;
        .context-menu {
            width: 150px;
            position: absolute;
            font-size: 18px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            width: fit-content;
            .menu-item {
                padding: 10px 20px;
                &:hover {
                    cursor: pointer;
                    background-color: #91c0ff;
                }
            }
            .menu-item+.menu-item {
                border-top: 1px solid #ccc;
            }
        }
        #resize {
            height: inherit;
            position: absolute;
            width: $borderline-width;
            top: 0;
            margin-left: calc(100% - 3 * #{$borderline-width});
            &:hover {
                cursor: e-resize;
            }
        }
    }
</style>
