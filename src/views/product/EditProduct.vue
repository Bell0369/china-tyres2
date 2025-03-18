<script setup>
import { reactive, ref, onMounted } from "vue"
import { getProductShowApi, updateProductApi } from "@/api/product"
import { ElMessage } from "element-plus"
import { useBrandSelect } from "@/hooks/useSelectOption.js"
import { useFactorySelect } from "@/hooks/useFactorySelect"

defineOptions({
  name: "EditProduct"
})

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

const ruleFormRef = ref()
const ruleForm = reactive({
  name: "",
  art: "",
  ean: "",
  brand_id: "",
  customs_code: "",
  quantity: "",
  standard_quantity: "",
  tyre_type: "",
  piece_weight: "",
  spout: "",
  type: "",
  decorative_design: "",
  european_standard: "",
  european_standard_level: "",
  sort: 0,
  factory_id: ""
})

const rules = reactive({
  name: [{ required: true, message: "請輸入產品名稱", trigger: "blur" }],
  art: [{ required: true, message: "請輸入產品代碼", trigger: "blur" }],
  ean: [{ required: true, message: "請輸入條碼", trigger: "blur" }],
  brand_id: [{ required: true, message: "請輸入品牌", trigger: "blur" }],
  customs_code: [{ required: true, message: "請輸入海關編碼", trigger: "blur" }],
  quantity: [{ required: true, message: "請輸入裝櫃量", trigger: "blur" }],
  standard_quantity: [{ required: true, message: "請輸入標準櫃量", trigger: "blur" }],
  tyre_type: [{ required: true, message: "請輸入輪胎類型", trigger: "blur" }],
  piece_weight: [{ required: true, message: "請輸入單重", trigger: "blur" }],
  type: [{ required: true, message: "請輸入類型", trigger: "blur" }],
  spout: [{ required: true, message: "請輸入寸口", trigger: "blur" }],
  decorative_design: [{ required: true, message: "請輸入花紋", trigger: "blur" }],
  factory_id: [{ required: true, message: "請选择工厂 ", trigger: "blur" }]
})

// 品牌
const { brandOptions } = useBrandSelect()

const { rowId } = defineProps(["rowId"])

const loading = ref(false)
onMounted(() => {
  if (rowId) {
    loading.value = true
    getProductShowApi({
      id: rowId
    })
      .then(({ data }) => {
        Object.assign(ruleForm, data.info)
        ruleForm.factory_id = data.factory[0].factory_id
        optionsFactory.value.push({
          id: data.factory[0].factory_id,
          name: data.factory[0].name
        })
      })
      .finally(() => {
        loading.value = false
      })
  }
})

const emitEvents = defineEmits(["childEvent"])
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      console.log("submit!")
      updateProductApi(ruleForm).then(() => {
        ElMessage.success("操作成功")
        emitEvents("childEvent")
      })
    } else {
      console.log("error submit!", fields)
    }
  })
}
</script>

<template>
  <div v-loading="loading">
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-position="top">
      <div class="overflow-hidden">
        <el-row :gutter="10">
          <el-col :span="6">
            <el-form-item label="產品名稱" prop="name">
              <el-input v-model="ruleForm.name" placeholder="請輸入產品名稱" :disabled="rowId" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="產品代碼(ART)" prop="art">
              <el-input v-model="ruleForm.art" placeholder="請輸入產品代碼(ART)" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="條碼ENA" prop="ean">
              <el-input v-model="ruleForm.ean" placeholder="請輸入條碼ENA" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="品牌" prop="brand_id">
              <el-select v-model="ruleForm.brand_id" :disabled="rowId">
                <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="海關編碼" prop="customs_code">
              <el-input v-model="ruleForm.customs_code" placeholder="請輸入海關編碼" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="40'HQ裝櫃量" prop="quantity">
              <el-input v-model="ruleForm.quantity" placeholder="請輸入裝櫃量" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="40'HQ標準櫃量" prop="standard_quantity">
              <el-input v-model="ruleForm.standard_quantity" placeholder="請輸入標準櫃量" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="輪胎類型TYPE" prop="tyre_type">
              <el-input v-model="ruleForm.tyre_type" placeholder="請輸入輪胎類型" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="單重" prop="piece_weight">
              <el-input v-model="ruleForm.piece_weight" type="number" placeholder="請輸入單重" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="類型" prop="type">
              <el-input v-model="ruleForm.type" placeholder="請輸入類型" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="花紋" prop="decorative_design">
              <el-input v-model="ruleForm.decorative_design" placeholder="請輸入花紋" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="寸口" prop="spout">
              <el-input v-model="ruleForm.spout" placeholder="請輸入寸口" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="歐標等級">
              <el-input v-model="ruleForm.european_standard_level" placeholder="請輸入歐標等級" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否歐標EU OR空白">
              <el-input v-model="ruleForm.european_standard" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="排序值">
              <el-input-number v-model="ruleForm.sort" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="工厂" prop="factory_id">
              <el-select
                v-model="ruleForm.factory_id"
                filterable
                remote
                remote-show-suffix
                :remote-method="loadFactoryData"
                :loading="loadFactory"
              >
                <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <div class="text-right">
        <el-button type="primary" @click="submitForm(ruleFormRef)"> 保存 </el-button>
      </div>
    </el-form>
  </div>
</template>
