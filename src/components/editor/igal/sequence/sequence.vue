<template>
    <div class="sequence">
        <header>
            <div class="uuid" contenteditable="false">{{ sequence.uuid }}</div>
            <div class="desc">{{ sequence.description }}</div>
        </header>
        <main>
            <component
                :is="item.type"
                v-for="(item, index) of data"
                :key="index"
                :info="item"
            ></component>
        </main>
        <footer contenteditable="false">
            <div
                class="next"
                :class="{ 'bg-color': isShowAll }"
                v-for="(uuid, index) of sequence.next"
                :key="index"
            >
                <div class="text" :class="{ 'show-text': isShowAll }">
                    {{ uuid }}
                </div>
                <div
                    class="delete iconfont icon-minus-bold"
                    @click="removeSequence(index)"
                ></div>
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
                        :class="{ existed: sequence.next.includes(uuid) }"
                        :key="index"
                        @click="linkToSequence($event.target, uuid)"
                    >
                        <template v-if="sequence.next.includes(uuid)">
                            <del>{{ uuid }}</del>
                        </template>
                        <template v-else>{{ uuid }}</template>
                    </li>
                </ul>
                <div class="add iconfont icon-plus-bold"></div>
            </div>
            <div
                class="show-all iconfont"
                :class="iconClass"
                @click="toggleShowAll()"
            ></div>
        </footer>
    </div>
</template>

<script>
import sentence from './sentence'
import linebreak from './linebreak'
import branch from './branch'

export default {
    props: {
        sequence: Object,
    },
    components: {
        sentence,
        linebreak,
        branch,
    },
    data() {
        return {
            input: '',
            isShowAll: false,
            data: this.sequence.data,
            next: [
                '9125a8dc-52ee-365b-a5aa-81b0b3681cf6',
                '2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d',
                'c6235813-3ba4-3801-ae84-e0a6ebb7d138',
                '1b671a64-40d5-491e-99b0-da01ff1f3341',
                'e8b5a51d-11c8-3310-a6ab-367563f20686',
            ], //项目下所有序列id
        }
    },
    methods: {
        removeSequence(index) {
            this.sequence.next.splice(index, 1)
        },
        linkToSequence(node, uuid) {
            if (node.nodeName === 'DEL') return
            node.parentNode.classList.remove('list-hover')
            setTimeout(() => {
                node.parentNode.classList.add('list-hover')
            }, 1500)
            if (!this.sequence.next.includes(uuid)) {
                this.sequence.next.push(uuid)
            }
        },
        search(input) {
            this.input = input.value
        },
        isShowList(uuid) {
            if (this.input === '') return true
            return uuid.startsWith(this.input)
        },
        toggleShowAll() {
            this.isShowAll = !this.isShowAll
        },
    },
    computed: {
        iconClass() {
            return this.isShowAll ? 'icon-xianshi' : 'icon-icon-eye-close'
        },
    },
}
</script>

<style lang="scss" scoped>
.sequence {
    background-color: #ebebeb91;
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 20px;
    header {
        .uuid {
            background: #ccc;
        }
    }
    footer {
        $width: 30px;
        $nomral-color: #59e6ff;
        $delete-color: #e65454;
        $add-color: #b1f8bb;
        $text-bg-color: #fff;
        $list-bg-color: #eeefda;
        $warning-bg-color: #f74040;
        @mixin anime() {
            transition: all 1s ease;
        }
        display: flex;
        flex-wrap: wrap;
        & > * {
            margin-right: $width / 2;
            margin-top: $width / 2;
            cursor: pointer;
        }
        .next {
            display: flex;
            position: relative;
            min-width: $width;
            height: $width;
            line-height: $width;
            border-radius: $width / 2;
            background-color: $nomral-color;
            @include anime;
            .text {
                max-width: 0;
                height: inherit;
                overflow: hidden;
                @include anime;
            }
            .delete {
                width: $width;
                height: inherit;
                text-align: center;
                border-radius: $width / 2;
                background-color: $nomral-color;
                &:hover {
                    background-color: $delete-color;
                }
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
                top: $width;
                min-width: 200px;
                max-width: 300px;
                max-height: 0;
                overflow: hidden;
                border-radius: $width / 2;
                background-color: $list-bg-color;
                @include anime;
                li {
                    white-space: nowrap;
                    text-align: center;
                    font-size: 20px;
                    padding: 0 10px;
                    overflow: hidden;
                    &:hover {
                        background-color: $add-color;
                    }
                }
                .existed {
                    background-color: $warning-bg-color;
                    cursor: no-drop;
                    &:hover {
                        background-color: $warning-bg-color;
                    }
                }
                & > li + li {
                    border-top: 1px solid;
                }
            }
            .add {
                width: $width;
                max-width: $width;
                height: inherit;
                overflow: hidden;
                text-align: center;
                border-radius: $width / 2;
                background-color: $add-color;
                @include anime;
            }
            &:hover {
                background-color: $text-bg-color;
                .text {
                    max-width: 200px;
                    padding: 0 $width / 2;
                }
                .search {
                    max-width: 200px;
                    padding: 0 $width / 2;
                    font-size: 25px;
                    background-color: $text-bg-color;
                }
                .list-hover {
                    max-height: 120px;
                    overflow: hidden scroll;
                }
                .add {
                    max-width: 0;
                }
            }
            .show-text {
                max-width: 200px;
                padding: 0 $width / 2;
            }
        }
        .bg-color {
            background-color: $text-bg-color;
        }
        .show-all {
            width: $width;
            height: $width;
            font-size: 28px;
        }
    }
}
</style>
