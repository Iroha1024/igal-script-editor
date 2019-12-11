<template>
    <div class="sequence">
        <header>
            <div class="title" contenteditable="false" v-show="showTitle">
                {{ sequence.customized.title }} --> {{ sequence.uuid }}
            </div>
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
                v-for="(item, index) of data"
                :key="index"
                :info="item"
            ></component>
        </main>
        <footer contenteditable="false">
            <div
                class="next"
                :class="{ 'bg-color': isShowNext }"
                v-if="uuid !== ''"
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
                class="show-next iconfont"
                :class="[isShowNext ? 'icon-xianshi' : 'icon-icon-eye-close']"
                @click="toggleShowNext()"
            ></div>
        </footer>
    </div>
</template>

<script>
import addButton from '@/components/button/add-button'
import deleteButton from '@/components/button/delete-button'
import sentence from './sentence'
import linebreak from './linebreak'
import branch from './branch'

export default {
    props: {
        sequence: Object,
        showTitle: {
            type: Boolean,
            default: true,
        },
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
            input: '',
            isShowNext: false,
            data: this.sequence.data,
            next: [
                '9125a8dc-52ee-365b-a5aa-81b0b3681cf6',
                '2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d',
                'c6235813-3ba4-3801-ae84-e0a6ebb7d138',
                '1b671a64-40d5-491e-99b0-da01ff1f3341',
                'e8b5a51d-11c8-3310-a6ab-367563f20686',
                '12',
            ], //项目下所有序列id
        }
    },
    inject: ['save'],
    methods: {
        //----------------------------------------footer----------------------------------------
        removeSequence(index) {
            this.sequence.next.splice(index, 1)
            this.save()
        },
        linkToSequence(node, uuid) {
            if (node.nodeName === 'DEL') return
            node.parentNode.classList.remove('list-hover')
            setTimeout(() => {
                node.parentNode.classList.add('list-hover')
            }, 1500)
            if (!this.sequence.next.includes(uuid)) {
                this.sequence.next.push(uuid)
                this.save()
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
        .title {
            background: linear-gradient(90deg, #0000002e, #ffffff00);
            cursor: pointer;
            user-select: none;
        }
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
        $warning-bg-color: #fc7171;
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
        .show-next {
            width: $button-size;
            height: $button-size;
            font-size: 28px;
        }
    }
}
</style>
