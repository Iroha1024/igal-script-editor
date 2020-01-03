<template>
    <div class="button-area">
        <div class="next-button button-area--add">
            <input class="search" type="text" v-model="input" />
            <ul class="uuid-list list--hover">
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
                    <template v-else-if="isOutside(uuid)">
                        {{ uuid }}
                    </template>
                    <template v-else>{{ uuid }}</template>
                </li>
            </ul>
            <add-button class="uuid-list--add"></add-button>
        </div>
        <div
            class="next-button button-area--delete"
            :class="{ 'bg-color': isShowUuidOfNext }"
            v-for="(uuid, index) of sequence.next"
            :key="index"
        >
            <div class="uuid-text" :class="{ 'show-text': isShowUuidOfNext }">
                {{ uuid }}
            </div>
            <delete-button
                class="uuid-text--delete"
                @click.native="removeSequence(index)"
            ></delete-button>
        </div>
        <div
            class="show-next iconfont"
            :class="[isShowUuidOfNext ? 'icon-xianshi' : 'icon-icon-eye-close']"
            @click="toggleShowNext()"
        ></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import addButton from '@/components/button/add-button'
import deleteButton from '@/components/button/delete-button'

export default {
    props: {
        sequence: Object,
    },
    components: {
        addButton,
        deleteButton,
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
        ...mapState({
            uuids: state => state.project.uuids,
        }),
        next() {
            return this.uuids.filter(
                uuid =>
                    !this.sequence.prev.includes(uuid) &&
                    uuid !== this.sequence.uuid
            )
        },
    },
    inject: ['save', 'igal'],
    methods: {
        //删除序列后，保存
        removeSequence(index) {
            this.sequence.next.splice(index, 1)
            this.save()
        },
        //新增序列后，保存
        linkToSequence(node, uuid) {
            this.input = ''
            if (node.nodeName === 'DEL') return
            node.parentNode.classList.remove('list--hover')
            setTimeout(() => {
                node.parentNode.classList.add('list--hover')
            }, 1500)
            if (!this.sequence.next.includes(uuid)) {
                this.sequence.next.push(uuid)
                this.save()
            }
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
            return !this.igal.list.map(sequence => sequence.uuid).includes(uuid)
        },
    },
}
</script>

<style lang="scss" scoped>
.button-area {
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
    .next-button {
        display: flex;
        position: relative;
        min-width: $button-size;
        height: $button-size;
        line-height: $button-size;
        border-radius: $button-size / 2;
        background-color: $nomral-button-color;
        @include anime;
        .uuid-text {
            max-width: 0;
            height: inherit;
            overflow: hidden;
            @include anime;
        }
        .uuid-text--delete {
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
        .uuid-list {
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
        .uuid-list--add {
            max-width: $button-size;
            overflow: hidden;
            @include anime;
            @include button;
        }
        &:hover {
            background-color: $text-bg-color;
            .uuid-text {
                max-width: 200px;
                padding: 0 $button-size / 2;
            }
            .search {
                max-width: 200px;
                padding: 0 $button-size / 2;
                font-size: 25px;
                background-color: $text-bg-color;
            }
            .list--hover {
                max-height: 120px;
                overflow: hidden scroll;
            }
            .uuid-list--add {
                max-width: 0;
            }
        }
        .show-text {
            max-width: 200px;
            padding: 0 $button-size / 2;
        }
    }
    .button-area--add {
        z-index: 101;
    }
    .button-area--delete {
        z-index: 100;
    }
    .bg-color {
        background-color: $text-bg-color;
    }
    .show-next {
        width: $button-size;
        height: $button-size;
        line-height: $button-size;
        font-size: 28px;
    }
}
</style>
