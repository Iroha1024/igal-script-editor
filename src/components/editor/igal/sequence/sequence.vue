<template>
    <div class="sequence">
        <header>
            <div
                class="customized-info"
                v-for="([key, value], index) of Object.entries(
                    sequence.customized
                )"
            >
                <div class="key" contenteditable="false">{{ key }}</div>
                <div class="value">{{ value }}</div>
            </div>
        </header>
        <main>
            <component
                :is="item.type"
                v-for="(item, index) of sequence.data"
                :key="index"
                :info="item"
            ></component>
        </main>
        <footer contenteditable="false">
            <div
                class="next"
                :class="{ 'bg-color': isShowUuidOfNext }"
                v-if="uuid !== ''"
                v-for="(uuid, index) of sequence.next"
                :key="index"
            >
                <div class="text" :class="{ 'show-text': isShowUuidOfNext }">
                    {{ uuid }}
                </div>
                <delete-button
                    class="text--delete"
                    @click.native="removeSequence(index)"
                ></delete-button>
            </div>
            <div class="next">
                <input
                    class="search"
                    type="text"
                    @input="search($event.target)"
                />
                <ul class="list list-hover">
                    <li
                        v-for="(uuid, index) of next"
                        v-show="isShowList(uuid)"
                        :class="{
                            existed: isExisted(uuid),
                            outside: isOutside(uuid),
                        }"
                        :key="index"
                        @click="linkToSequence($event.target, uuid)"
                    >
                        <template v-if="isExisted(uuid)">
                            <del>{{ uuid }}</del>
                        </template>
                        <template v-else-if="isOutside(uuid)">{{
                            uuid
                        }}</template>
                        <template v-else>{{ uuid }}</template>
                    </li>
                </ul>
                <add-button class="list--add"></add-button>
            </div>
            <div
                class="show-next iconfont"
                :class="[
                    isShowUuidOfNext ? 'icon-xianshi' : 'icon-icon-eye-close',
                ]"
                @click="toggleShowNext()"
            ></div>
        </footer>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import addButton from '@/components/button/add-button'
import deleteButton from '@/components/button/delete-button'
import sentence from './sentence'
import linebreak from './linebreak'
import branch from './branch'

import { isNextEmpty } from '@/utils/readIgal'

export default {
    props: {
        sequence: Object,
    },
    components: {
        addButton,
        deleteButton,
        sentence,
        linebreak,
        branch,
    },
    data() {
        return {
            //搜索uuid
            input: '',
            //是否展示next内uuid
            isShowUuidOfNext: false,
        }
    },
    computed: {
        ...mapState(['uuids']),
        next() {
            return this.uuids.filter(
                uuid =>
                    !this.sequence.prev.includes(uuid) &&
                    uuid !== this.sequence.uuid
            )
        },
    },
    inject: ['save', 'list'],
    methods: {
        //----------------------------------------footer----------------------------------------
        //删除序列后，保存
        removeSequence(index) {
            this.sequence.next.splice(index, 1)
            this.save()
        },
        //新增序列后，保存
        linkToSequence(node, uuid) {
            if (node.nodeName === 'DEL') return
            node.parentNode.classList.remove('list-hover')
            setTimeout(() => {
                node.parentNode.classList.add('list-hover')
            }, 1500)
            if (!this.sequence.next.includes(uuid)) {
                if (isNextEmpty(this.sequence.next)) {
                    this.sequence.next.splice(0, 1, uuid)
                } else {
                    this.sequence.next.push(uuid)
                }
                this.save()
            }
        },
        search(input) {
            this.input = input.value
        },
        //展示查询内容
        isShowList(uuid) {
            if (this.input === '') return true
            return uuid.startsWith(this.input)
        },
        toggleShowNext() {
            this.isShowUuidOfNext = !this.isShowUuidOfNext
        },
        //已经连接序列
        isExisted(uuid) {
            return this.sequence.next.includes(uuid)
        },
        //不属于当前igal文件中的序列
        isOutside(uuid) {
            return !this.list.map(sequence => sequence.uuid).includes(uuid)
        },
    },
}
</script>

<style lang="scss" scoped>
.sequence {
    background-color: #ebebeb91;
    border-radius: 0 0 10px 10px;
    padding: $sequence-padding;
    margin-bottom: 20px;
    header {
        .customized-info {
            display: flex;
            align-items: center;
            line-height: 40px;
            .key {
                flex: 0 0 20%;
                user-select: none;
            }
            .value {
                flex: 1;
            }
        }
    }
    footer {
        $text-bg-color: #fff;
        $forbidden-bg-color: #fc7171;
        $delete-color: #e65454;
        @mixin anime() {
            transition: all 1s ease;
        }
        display: flex;
        flex-wrap: wrap;
        user-select: none;
        & > * {
            margin-right: $button-size / 2;
            margin-top: $button-size / 2;
            cursor: pointer;
        }
        .next {
            display: flex;
            position: relative;
            min-width: $button-size;
            height: $button-size;
            line-height: $button-size;
            border-radius: $button-size / 2;
            background-color: $nomral-button-color;
            @include anime;
            .text {
                max-width: 0;
                height: inherit;
                overflow: hidden;
                @include anime;
            }
            .text--delete {
                @include button($delete-color);
            }
            .search {
                max-width: 0;
                height: inherit;
                overflow: hidden;
                border-radius: 10px;
                border: 0;
                outline: none;
                @include anime;
            }
            .list {
                position: absolute;
                top: $button-size;
                min-width: 200px;
                max-width: 300px;
                max-height: 0;
                overflow: hidden;
                border-radius: $button-size / 2;
                background-color: $list-bg-color;
                @include anime;
                li {
                    white-space: nowrap;
                    text-align: center;
                    font-size: 20px;
                    padding: 0 10px;
                    overflow: hidden;
                    &:hover {
                        background-color: $list-hover-color;
                    }
                }
                .existed {
                    background-color: $forbidden-bg-color;
                    cursor: no-drop;
                    &:hover {
                        background-color: $forbidden-bg-color;
                    }
                }
                .outside {
                    background-color: #e4e148;
                    cursor: wait;
                    &:hover {
                        background-color: #f8f691;
                    }
                }
                & > li + li {
                    border-top: 1px solid;
                }
            }
            .list--add {
                max-width: $button-size;
                overflow: hidden;
                @include anime;
                @include button;
            }
            &:hover {
                background-color: $text-bg-color;
                .text {
                    max-width: 200px;
                    padding: 0 $button-size / 2;
                }
                .search {
                    max-width: 200px;
                    padding: 0 $button-size / 2;
                    font-size: 25px;
                    background-color: $text-bg-color;
                }
                .list-hover {
                    max-height: 120px;
                    overflow: hidden scroll;
                }
                .list--add {
                    max-width: 0;
                }
            }
            .show-text {
                max-width: 200px;
                padding: 0 $button-size / 2;
            }
        }
        .bg-color {
            background-color: $text-bg-color;
        }
        .show-next {
            width: $button-size;
            height: $button-size;
            font-size: 28px;
        }
    }
}
</style>
