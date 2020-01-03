<template>
    <div class="config">
        <div class="config__tab">
            <div class="iconfont icon-ai207 back" @click="back"></div>
        </div>
        <hr />
        <div class="config__container" @input="changeVal($event)">
            <div
                class="config-item"
                v-for="([key, { value, type }], index) of Object.entries(data)"
            >
                <div class="item--key">{{ key }}</div>
                <template v-if="type === 'input'">
                    <input
                        class="item--value"
                        :index="key"
                        v-model.number="data[key].value"
                        type="number"
                    />
                </template>
                <template v-else-if="type === 'select'">
                    <select class="item--value" v-model="data[key].value">
                        <option
                            v-for="({ text, value }, index) of getSelectValue(
                                key
                            )"
                            :value="value"
                            >{{ text }}</option
                        >
                    </select>
                </template>
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
        ...mapState({
            configData: state => state.program.configData,
        }),
    },
    data() {
        return {
            backPath: '',
            data: null,
            fontFamily: [
                { text: '默认', value: 'none' },
                { text: 'fantasy', value: 'fantasy' },
                { text: '华文中宋', value: 'STZhongsong' },
                { text: '华文隶书', value: 'STLiti' },
                { text: '华文彩云', value: 'STCaiyun' },
                { text: '华文仿宋', value: 'STFangsong' },
            ],
        }
    },
    created() {
        this.data = JSON.parse(JSON.stringify(this.configData))
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.backPath = from.path
        })
    },
    methods: {
        back() {
            this.$router.push({ path: this.backPath })
        },
        getSelectValue(key) {
            return this[key]
        },
        changeVal(event) {
            const key = event.target.getAttribute('index')
            switch (key) {
                case 'fontSize':
                    const min = 20,
                        max = 40
                    if (event.target.value > max) {
                        this.data[key].value = max
                    }
                    //当有输入值，且数位大于1，且数值小于min时
                    if (
                        event.data &&
                        event.target.value.length > 1 &&
                        event.target.value < min
                    ) {
                        this.data[key].value = min
                    }
                    if (event.target.value.includes('.')) {
                        this.data[key].value = Number(
                            event.target.value
                        ).toFixed(1)
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
            align-items: center;
            & * {
                margin-left: 20px;
            }
            .item--value {
                padding: 5px 0 5px 10px;
                width: 200px;
                outline: none;
                font-size: 20px;
            }
            input {
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
            user-select: none;
            &:hover {
                background-color: #67ec4c;
            }
        }
    }
}
</style>
