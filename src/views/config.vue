<template>
    <div class="config">
        <div class="config__tab">
            <div class="iconfont icon-ai207 back" @click="back"></div>
        </div>
        <hr />
        <div class="config__container" @input="changeVal($event)">
            <div class="config-item" v-for="(key, index) of Object.keys(data)">
                <div class="item--key">{{ key }}</div>
                <input
                    class="item--value"
                    :index="key"
                    v-model.number="data[key]"
                    type="number"
                />
            </div>
            <div class="save" @click="save">保存</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { ipcRenderer } from 'electron'

export default {
    computed: {
        ...mapState(['configData']),
    },
    data() {
        return {
            data: null,
        }
    },
    created() {
        this.data = JSON.parse(JSON.stringify(this.configData))
    },
    methods: {
        back() {
            this.$router.push({ path: '/' })
        },
        changeVal(event) {
            const key = event.target.getAttribute('index')
            switch (key) {
                case 'fontSize':
                    const min = 20,
                        max = 40
                    if (event.target.value > max) {
                        this.data[key] = max
                    }
                    //当有输入值，且数位大于1，且数值小于min时
                    if (
                        event.data &&
                        event.target.value.length > 1 &&
                        event.target.value < min
                    ) {
                        this.data[key] = min
                    }
                    if (event.target.value.includes('.')) {
                        this.data[key] = Number(event.target.value).toFixed(1)
                    }
                    break
            }
        },
        save() {
            this.$store.commit(
                'setConfigData',
                JSON.parse(JSON.stringify(this.data))
            )
            ipcRenderer.send('set-config', this.data)
            ipcRenderer.once('save-config', () => {
                console.log('保存成功')
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.config {
    background-color: #f9fae4;
    height: inherit;
    font-size: 25px;
    overflow-y: scroll;
    .config__tab {
        .back {
            font-size: 50px;
            width: 50px;
            padding: 20px;
            cursor: pointer;
        }
    }
    hr {
        margin-top: 0;
    }
    .config__container {
        width: 80%;
        min-height: 400px;
        margin: 50px auto;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        .config-item {
            display: flex;
            & * {
                margin-left: 20px;
            }
            input {
                outline: none;
                font-size: 20px;
                padding-left: 10px;
                &::-webkit-outer-spin-button,
                &::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                }
            }
        }
        .save {
            width: 100px;
            text-align: center;
            padding: 5px;
            background-color: #a5f496;
            border-radius: 5px;
            cursor: pointer;
            &:hover {
                background-color: #67ec4c;
            }
        }
    }
}
</style>
