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
            data: this.echarts.data,
            links: this.echarts.links,
            chart: null,
        }
    },
    mounted() {
        const map = this.$refs.map
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
                    data: this.data,
                    links: this.links,
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
        const parent = window.getComputedStyle(this.$parent.$el)
        const height = document.documentElement.clientHeight
        this.chart = echarts.init(map, '', { width: parent.width, height })
        this.chart.setOption(option)
        window.addEventListener('resize', () => {
            const height = document.documentElement.clientHeight
            this.chart.resize({ width: parent.width, height })
        })
    },
}
</script>

<style lang="scss" scoped>
.map {
    position: fixed;
}
</style>
