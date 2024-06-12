<script setup>
import { ref } from "vue"

const radioVal = ref(0)
const childData = ref({
  type: 0,
  price: "",
  per: ""
})

const changeRadio = () => {
  radioVal.value ? (childData.value.price = "") : (childData.value.per = "")
}

defineExpose({
  childData
})
</script>

<template>
  <div>
    <div class="m-b5">
      <el-text>輸入金額後會將該客戶或該工廠下的產品價格都進行調整，調整金額和百分比可以輸入負數</el-text>
    </div>
    <div class="m-b5">
      <el-radio-group v-model="radioVal" @change="changeRadio">
        <el-radio-button label="按金額調整" :value="0" />
        <el-radio-button label="按百分比調整" :value="1" />
      </el-radio-group>
    </div>
    <el-row>
      <el-col :span="12">
        <div v-show="radioVal === 0">
          <el-input v-model="childData.price" placeholder="請輸入金額" type="number" />
        </div>
        <div v-show="radioVal === 1">
          <el-input v-model="childData.per" placeholder="請輸入百分比" type="number">
            <template #append>%</template>
          </el-input>
        </div>
      </el-col>
      <el-col :span="1" />
      <el-col :span="10">
        <el-switch
          v-model="childData.type"
          active-value="1"
          inactive-value="2"
          active-text="增加"
          inactive-text="減少"
        />
      </el-col>
    </el-row>
    <div class="m-t5 line-height-6">
      <div class="mx-1 m-b2">
        <el-text type="danger">註：調整後金額=調整前金額+調整金額</el-text>
      </div>
      <div class="mx-1">
        <el-text type="danger">如：調整前100 調整金額20 調整後120<br />調整前100 調整金額百分比2% 調整後102 </el-text>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
