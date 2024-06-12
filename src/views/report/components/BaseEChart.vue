<script setup>
import { ref, inject, onMounted, watch, onUnmounted } from "vue"

const props = defineProps({
  chartOption: Object
})

const container = ref()

//引入
const echarts = inject("$echarts")

let myChart = null
onMounted(() => {
  myChart = echarts.init(container.value)

  window.onresize = function () {
    myChart.resize()
  }
})

watch(props.chartOption, () => {
  // 绘制图表
  myChart.setOption(props.chartOption)
})

// 销毁 echart 实例，释放资源
onUnmounted(() => {
  myChart.dispose()
})
</script>

<template>
  <div ref="container" style="min-width: 100%; height: 500px" />
</template>

<style scoped></style>
