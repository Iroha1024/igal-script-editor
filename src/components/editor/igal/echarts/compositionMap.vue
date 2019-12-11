<template>
    <div class="map" ref="map"></div>
</template>

<script>
import echarts from 'echarts'

export default {
    props: {
        echarts: Object,
    },
    data() {
        return {
            chart: null,
        }
    },
    mounted() {
        const map = this.$refs.map
        const option = this.getOption()
        const parent = window.getComputedStyle(this.$parent.$el)
        const height = document.documentElement.clientHeight
        this.chart = echarts.init(map, '', { width: parent.width, height })
        this.chart.setOption(option)
        window.addEventListener('resize', () => {
            const height = document.documentElement.clientHeight
            this.chart.resize({ width: parent.width, height })
        })
    },
    watch: {
        echarts() {
            const option = this.getOption()
            this.chart.setOption(option)
        },
    },
    methods: {
        getOption() {
            const data = this.echarts.data
            const links = this.echarts.links
            const option = {
                animationDurationUpdate: 1500,
                animationEasingUpdate: 'quinticInOut',
                series: [
                    {
                        type: 'graph',
                        layout: 'none',
                        symbolSize: 50,
                        roam: true,
                        label: {
                            normal: {
                                show: true,
                            },
                        },
                        edgeSymbol: ['circle', 'arrow'],
                        edgeSymbolSize: [4, 10],
                        edgeLabel: {
                            normal: {
                                textStyle: {
                                    fontSize: 20,
                                },
                            },
                        },
                        focusNodeAdjacency: true,
                        data,
                        links,
                        lineStyle: {
                            normal: {
                                opacity: 0.9,
                                width: 2,
                                curveness: 0,
                            },
                        },
                    },
                ],
            }
            return option
        },
    },
}
</script>

<style lang="scss" scoped>
.map {
    position: fixed;
    z-index: 100;
}
</style>
