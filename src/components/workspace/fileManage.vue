<template>
    <div class="file-manage">
        <div class="resize-drag" id="resizeDrag">
            <dir></dir>
        </div>
    </div>
</template>

<script>
import fs from 'fs'
import Path from 'path'

import { ipcRenderer } from 'electron'
import interact from 'interactjs'
import { mapState } from 'vuex'

import dir from '../fileManage/dir'

import { readDir } from '@/utils/readIgal'

export default {
    computed: {
        ...mapState(['dirPath', 'files']),
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
                let dirPath = path[0]
                //没选择文件夹，则取消
                if (dirPath) {
                    this.$store.commit('setFiles', [])
                    //获取项目文件路径
                    this.$store.commit('setDirPath', dirPath)
                    this.files.push({
                        name: Path.basename(dirPath),
                        path: dirPath,
                        type: 'dir',
                        isEdit: false,
                        isNewBuilt: false,
                    })
                    this.getDirContents(dirPath, this.files)
                }
            })
        },
        //获取文件夹内信息，传入files
        async getDirContents(path, parent) {
            const operateItemOfDir = async (path, files, parent) => {
                for (const file of files) {
                    if (file.isDirectory()) {
                        const newParent = []
                        parent.push(newParent)
                        newParent.push({
                            name: file.name,
                            path: Path.resolve(path, file.name),
                            type: 'dir',
                            isNewBuilt: false,
                            isEdit: false,
                        })
                        await this.getDirContents(
                            Path.resolve(path, file.name),
                            newParent
                        )
                    } else {
                        if (
                            Path.resolve(path, file.name) ===
                            Path.resolve(this.dirPath, 'setting.json')
                        ) {
                            //获取配置信息路径，更新uuids
                            this.$store.commit(
                                'setConfigPath',
                                Path.resolve(path, file.name)
                            )
                            this.$store.dispatch('updateUuids')
                        }
                        parent.push({
                            name: file.name,
                            path: Path.resolve(path, file.name),
                            type: 'file',
                            isEdit: false,
                            isNewBuilt: false,
                        })
                    }
                }
            }
            const files = await readDir(path)
            await operateItemOfDir(path, files, parent)
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
$width: 280px;
.file-manage {
    min-width: $width;
    height: inherit;
    user-select: none;
    z-index: 100;
    overflow-y: scroll;
    .resize-drag {
        width: $width;
        max-width: 400px;
        min-height: 100%;
        border: 8px solid transparent;
        box-sizing: border-box;
        touch-action: none;
        background-color: $list-bg-color;
    }
}
</style>
