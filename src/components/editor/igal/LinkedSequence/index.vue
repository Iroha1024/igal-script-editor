<template>
    <div class="linked-sequence">
        <div v-for="(rankList, rank) of linked" :key="rank">
            <div class="tabs">
                <div class="tab__nav" contenteditable="false">
                    <div
                        class="tab"
                        :class="{
                            'active-tab': sequence.active,
                            'related-tab': isRelated(linked, rank, sequence),
                            'irrelated-tab': isIrrelated(
                                linked,
                                rank,
                                sequence
                            ),
                        }"
                        v-for="(sequence, index) of rankList"
                        :key="index"
                        :title="
                            computedTitle(
                                sequence.customized.title,
                                sequence.uuid
                            )
                        "
                        @click="toggleActive(rankList, sequence)"
                    >
                        {{
                            computedTitle(
                                sequence.customized.title,
                                sequence.uuid
                            )
                        }}
                    </div>
                </div>
                <div
                    class="tab__content"
                    v-for="(sequence, index) of rankList"
                    :key="index"
                >
                    <sequence
                        v-show="sequence.active"
                        :sequence="sequence"
                        :showTitle="false"
                    ></sequence>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import sequence from '../sequence/sequence'

export default {
    props: {
        linked: Array,
    },
    components: {
        sequence,
    },
    methods: {
        computedTitle(title, uuid) {
            if (title) {
                return `${title} --> ${uuid}`
            }
            return uuid
        },
        isRelated(linked, rank, sequence) {
            if (rank === 0) return false
            const prevActiveSequence = linked[rank - 1].filter(
                prevRankSequence => prevRankSequence.active
            )
            return prevActiveSequence[0].next.includes(sequence.uuid)
        },
        isIrrelated(linked, rank, sequence) {
            if (rank === 0) return false
            return !this.isRelated(linked, rank, sequence)
        },
        //点击切换
        toggleActive(rankList, sequence) {
            rankList.forEach(sequence => {
                sequence.active = false
            })
            sequence.active = true
        },
    },
}
</script>

<style lang="scss" scoped>
.tabs {
    .tab__nav {
        display: flex;
        padding: 0 10px;
        font-size: 20px;
        user-select: none;
        .tab {
            width: 100px;
            cursor: pointer;
            overflow: hidden;
            white-space: nowrap;
        }
        .active-tab {
            background-color: #5be65b !important;
        }
        .related-tab {
            background-color: #3dbbf5;
        }
        .irrelated-tab {
            background-color: #ccc;
        }
    }
}
</style>
