<script setup>
import { reactive, ref, watch, defineProps } from "vue"
import { ElMessage } from "element-plus"
import { getInlandFeeApi, updateInlandFeeApi } from "@/api/order"
import { usePayerListSelect, useFreightForwarderListSelect } from "@/hooks/useSelectOption"

const props = defineProps({
  rowId: Number
})

watch(
  () => props.rowId,
  () => {
    getInlandFeeDetail()
  }
)

const loading = ref(false)

// 付款方
const payerListOptions = usePayerListSelect()

// 船代
const freightForwarderListOptions = useFreightForwarderListSelect()

// 內陸費用
const inlandFee = reactive({
  bell_price: "",
  payee: "",
  payer: "",
  payer_time: "",
  cargo_manifest_amount: "",
  freight_forwarder: "",
  freight_rate: "",
  factory_responsibility_price: "",
  factory_responsibility_remarks: "",
  remarks: ""
})
const getInlandFeeDetail = () => {
  loading.value = true
  getInlandFeeApi({
    id: props.rowId
  })
    .then(({ data }) => {
      const {
        bell_price,
        payee,
        payer,
        payer_time,
        cargo_manifest_amount,
        freight_forwarder,
        freight_rate,
        factory_responsibility_price,
        factory_responsibility_remarks,
        remarks
      } = data

      inlandFee.bell_price = bell_price
      inlandFee.payee = payee
      inlandFee.payer = payer
      inlandFee.payer_time = payer_time === "0000-00-00 00:00:00" ? "" : payer_time
      inlandFee.cargo_manifest_amount = cargo_manifest_amount
      inlandFee.freight_forwarder = freight_forwarder
      inlandFee.freight_rate = freight_rate
      inlandFee.factory_responsibility_price = factory_responsibility_price
      inlandFee.factory_responsibility_remarks = factory_responsibility_remarks
      inlandFee.remarks = remarks
    })
    .finally(() => {
      loading.value = false
    })
}

const emitEvents = defineEmits(["childEvent"])
const submitForm = () => {
  loading.value = true
  updateInlandFeeApi({
    id: props.rowId,
    ...inlandFee
  })
    .then(() => {
      ElMessage.success("操作成功")
      emitEvents("childEvent")
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div>
    <div>
      <el-form>
        <div v-loading="loading" class="overflow-hidden">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="賬單金額">
                <el-input v-model="inlandFee.bell_price" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="收款方">
                <el-input v-model="inlandFee.payee" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="付款方">
                <el-select v-model="inlandFee.payer" style="width: 100%">
                  <el-option v-for="item in payerListOptions" :key="item.id" :label="item.name" :value="item.name" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="付款時間">
                <el-date-picker v-model="inlandFee.payer_time" type="datetime" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="運費">
                <el-input type="number" v-model="inlandFee.freight_rate" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="舱单金额">
                <el-input type="number" v-model="inlandFee.cargo_manifest_amount" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="船代">
                <el-select v-model="inlandFee.freight_forwarder" style="width: 100%">
                  <el-option
                    v-for="item in freightForwarderListOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="備注">
                <el-input v-model="inlandFee.remarks" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工廠責任額外支付金額">
                <el-input type="number" v-model="inlandFee.factory_responsibility_price" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工廠責任額外支付原因">
                <el-input v-model="inlandFee.factory_responsibility_remarks" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="text-right">
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped></style>
