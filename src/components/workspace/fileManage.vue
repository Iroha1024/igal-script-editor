<template>
    <div class="file-manage">
        <div class="resize-drag" id="resizeDrag">
            <dir :files="files"></dir>
        </div>
    </div>
</template>

<script>
import fs from 'fs'

import { ipcRenderer } from 'electron'
import interact from 'interactjs'
import { mapState } from 'vuex'

import dir from '../fileManage/dir'

export default {
    data() {
        return {
            files: [],
        }
    },
    computed: {
        ...mapState(['dirPath']),
    },
    components: {
        dir,
    },
    mounted() {
        this.getDirName()
        this.resize()
    },
    methods: {
        //获取文件夹信息
        getDirName() {
            ipcRenderer.on('select-dir', (event, path) => {
                //没选择文件夹，则取消
                if (path.length < 1) return
                this.files = []
                let dirPath = path[0]
                this.setDirPath(dirPath)
                if (dirPath) {
                    this.files.push({ path: dirPath, type: 'dir' })
                    this.getDirContents(dirPath, this.files)
                    this.setFiles(this.files)
                    // console.log(this.files);
                }
            })
        },
        //获取项目文件路径
        setDirPath(path) {
            this.$store.commit('setDirPath', path)
        },
        //获取配置信息路径，更新uuids
        setConfigPath(path) {
            this.$store.commit('setConfigPath', path)
            this.$store.dispatch('updateUuids')
        },
        //获取所有文件及文件夹
        setFiles(files) {
            this.$store.commit('setFiles', files)
        },
        // 获取文件夹内信息，传入files
        getDirContents(path, parent) {
            fs.readdirSync(path).forEach(file => {
                if (fs.statSync(`${path}\\${file}`).isDirectory()) {
                    const newParent = []
                    parent.push(newParent)
                    newParent.push({
                        path: `${path}\\${file}`,
                        type: 'dir',
                        isEdit: false,
                        isNewBuilt: false,
                    })
                    this.getDirContents(`${path}\\${file}`, newParent)
                } else {
                    if (
                        `${path}\\${file}` === `${this.dirPath}\\setting.json`
                    ) {
                        this.setConfigPath(`${path}\\${file}`)
                    }
                    parent.push({
                        path: `${path}\\${file}`,
                        type: 'file',
                        isEdit: false,
                        isNewBuilt: false,
                    })
                }
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
                            min: { width: 280 },
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
    min-width: 280px;
    flex-shrink: 0;
    height: inherit;
    user-select: none;
    z-index: 100;
    overflow-y: scroll;
    .resize-drag {
        max-width: 400px;
        min-height: 100%;
        border: 8px solid transparent;
        box-sizing: border-box;
        touch-action: none;
        background-color: $list-bg-color;
    }
}
</style>
