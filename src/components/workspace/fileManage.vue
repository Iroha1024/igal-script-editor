<template>
    <div class="file-manage">
        <div class="resize-drag" ref="fileArea">
            <dir :files="files"></dir>
            <div class="context-menu" v-show="showMenu" ref="contextMenu">
                <div class="menu-item" ref="openDir">打开文件夹</div>
            </div>
        </div>
    </div>
</template>

<script>
import fs from 'fs'

import interact from 'interactjs'

import { openDirectory } from '@/electron/renderer'
import { ipcRenderer } from 'electron'

import dir from '../fileManage/dir'

export default {
    data() {
        return {
            showMenu: false,
            files: [],
        }
    },
    components: {
        dir,
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
                this.getDirPath(dirPath)
                if (dirPath) {
                    this.files.push({ path: dirPath, type: 'dir' })
                    this.getDirContents(dirPath, this.files)
                    // console.log(this.files);
                }
            })
        },
        //获取项目文件路径
        getDirPath(path) {
            this.$store.commit('setDirPath', path)
        },
        //获取配置信息路径
        getSettingJson(path) {
            this.$store.commit('setConfigPath', path)
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
                    if (file === 'setting.json') {
                        this.getSettingJson(`${path}\\${file}`)
                    }
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
                contextMenu.style.top = event.clientY + 'px'
                contextMenu.style.left = event.clientX + 'px'
            })
            window.addEventListener('click', () => {
                this.showMenu = false
            })
        },
        //调整文件区大小
        resize() {
            interact('.resize-drag')
                .resizable({
                    // resize from all edges and corners
                    edges: { right: true },

                    modifiers: [
                        // keep the edges inside the parent
                        interact.modifiers.restrictEdges({
                            outer: 'parent',
                            endOnly: true,
                        }),

                        // minimum size
                        interact.modifiers.restrictSize({
                            min: { width: 250 },
                        }),
                    ],

                    inertia: {
                        resistance: 30,
                        minSpeed: 200,
                        endSpeed: 100,
                    },
                })
                .on('resizemove', event => {
                    let { x, y } = event.target.dataset

                    x = parseFloat(x) || 0
                    y = parseFloat(y) || 0

                    Object.assign(event.target.style, {
                        width: `${event.rect.width}px`,
                        height: `${event.rect.height}px`,
                        transform: `translate(${event.deltaRect.left}px, ${event.deltaRect.top}px)`,
                    })

                    Object.assign(event.target.dataset, { x, y })
                })
        },
    },
}
</script>

<style lang="scss" scoped>
.file-manage {
    min-width: 250px;
    flex-shrink: 0;
    height: inherit;
    background-color: #e9e9e9;
    user-select: none;
    .resize-drag {
        max-width: 400px;
        height: inherit;
        padding: 0px 5px;
        border: 5px solid transparent;
        box-sizing: border-box;
        height: inherit;
        touch-action: none;
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
                    background-color: $nomral-button-color;
                }
            }
            .menu-item + .menu-item {
                border-top: 1px solid #ccc;
            }
        }
    }
}
</style>
