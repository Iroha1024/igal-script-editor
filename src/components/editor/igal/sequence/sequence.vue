<template>
    <div class="sequence">
        <header>
            <div class="uuid" contenteditable="false">{{ sequence.uuid }}</div>
            <div
                class="customized-info"
                v-for="(key, index) of Object.keys(sequence.customized)"
            >
                <!-- <delete-button class="customized-info--delete" contenteditable="false" @click.native="removeInfo(key)"></delete-button> -->
                <div class="key" contenteditable="false">{{ key }}</div>
                <div class="value">{{ sequence.customized[key] }}</div>
            </div>
            <!-- <div class="customized-info--input">
                <template v-if="!isShowInput">
                    <add-button class="customized-info--add" contenteditable="false" @click.native="toggleShowInput"></add-button>
                </template>
                <template v-else>
                    <confirm-button class="customized-info--confirm" contenteditable="false" @click.native="toggleShowInput"></confirm-button>
                </template>
            </div> -->
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
                :class="{ 'bg-color': isShowNext }"
                v-for="(uuid, index) of sequence.next"
                :key="index"
            >
                <div class="text" :class="{ 'show-text': isShowNext }">
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
                <add-button class="list--add"></add-button>
            </div>
            <div
                class="show-all iconfont"
                :class="[isShowNext ? 'icon-xianshi' : 'icon-icon-eye-close']"
                @click="toggleShowNext()"
            ></div>
        </footer>
    </div>
</template>

<script>
import addButton from '@/components/button/add-button'
import deleteButton from '@/components/button/delete-button'
import confirmButton from '@/components/button/confirm-button'
import sentence from './sentence'
import linebreak from './linebreak'
import branch from './branch'

export default {
    props: {
        sequence: Object,
    },
    components: {
        addButton,
        deleteButton,
        confirmButton,
        sentence,
        linebreak,
        branch,
    },
    data() {
        return {
            input: '',
            // isShowInput: false,
            isShowNext: false,
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
        //----------------------------------------header----------------------------------------
        // removeInfo(key) {
        //     this.$delete(this.sequence.customized, key)
        // },
        // toggleShowInput() {
        //     this.isShowInput = !this.isShowInput
        // },
        //----------------------------------------footer----------------------------------------
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
        toggleShowNext() {
            this.isShowNext = !this.isShowNext
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
        // @mixin button-spacing {
        //     margin: 5px 5px 5px 0;
        // }
        .uuid {
            background-color: #ccc;
        }
        .customized-info {
            display: flex;
            align-items: center;
            line-height: 40px;
            // .customized-info--delete {
            //     @include button($delete-color);
            //     @include button-spacing;
            // }
            .key {
                flex: 0 0 20%;
                user-select: none;
            }
            .value {
                flex: 1;
            }
        }
        // .customized-info--input {
        //     .customized-info--add {
        //         @include button($add-color);
        //         @include button-spacing;
        //     }
        //     .customized-info--confirm {
        //         font-weight: bold;
        //         @include button($add-color);
        //         @include button-spacing;
        //     }
        // }
    }
    footer {
        $text-bg-color: #fff;
        $list-bg-color: #eeefda;
        $warning-bg-color: #f74040;
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
        .show-all {
            width: $button-size;
            height: $button-size;
            font-size: 28px;
        }
    }
}
</style>
