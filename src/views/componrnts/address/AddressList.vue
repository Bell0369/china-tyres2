<script setup>
import { ref, reactive, onMounted, watch, defineEmits } from "vue"
import { Edit, Delete } from "@element-plus/icons-vue"
import { useRoute } from "vue-router"
import { getFactoryContactApi, getClientContactApi, deleteClientContactApi, deleteFactoryContactApi } from "@/api/users"
import { Dialog } from "@/components/Dialog"
import UpdateAddress from "./UpdateAddress.vue"
import { useDeleteList } from "@/hooks/useDeleteList"

const props = defineProps({
  defaultId: Number,
  addressType: String
})

const emits = defineEmits(["updataContact", "getBasicInfo"])

const addressType = props.addressType

const loading = ref(false)

const route = useRoute()

// 联系人信息
const ContactList = ref([])
const getContact = () => {
  loading.value = true
  const api = addressType === "factory" ? getFactoryContactApi : getClientContactApi
  api({
    id: route.query.id
  })
    .then(({ data }) => {
      ContactList.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

const defaultContact = ref(0)
onMounted(() => {
  getContact()
  watch(
    () => props.defaultId,
    (newValue) => {
      console.log(newValue)
      defaultContact.value = newValue
    }
  )
})

const dialogVisible = ref(false)
const addressData = reactive({})
const connectUpdate = (row) => {
  dialogVisible.value = true
  if (row) {
    Object.assign(addressData, row)
  } else {
    Object.keys(addressData).forEach((key) => {
      delete addressData[key]
    })
  }
}

// 編輯完成
const handleChildEvent = () => {
  dialogVisible.value = false
  getContact()
  if (!props.defaultId) {
    emits("getBasicInfo")
  }
}

// 切換默認
const defaultAddress = (id) => {
  defaultContact.value = id
  emits("updataContact", id)
}

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: addressType === "factory" ? deleteFactoryContactApi : deleteClientContactApi,
  text: "聯繫人?"
})

// 删除-成功
watch([isDeleted], () => {
  getContact()
})
</script>

<template>
  <div class="" v-loading="loading">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">聯繫人信息</el-text>
          <el-button type="primary" @click="connectUpdate(0)">添加</el-button>
        </div>
      </div>
      <el-row :gutter="20" v-if="ContactList.length > 0">
        <el-col :span="8" v-for="item in ContactList" :key="item.id">
          <div class="flex items-center mb">
            <el-card
              shadow="never"
              @click="defaultAddress(item.id)"
              class="cursor-pointer"
              :class="defaultContact === item.id ? 'bg-#fffcb2!' : ''"
            >
              <el-text> {{ item.assemble }} </el-text>
            </el-card>
            <div class="m-l1">
              <Edit class="w6 h6 cursor-pointer" @click="connectUpdate(item)" />
              <br />
              <Delete class="w6 h6 cursor-pointer" @click="handleDelete(item.id)" />
            </div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-else description="暫無聯繫人" />
    </el-card>

    <!-- 編輯聯繫人 -->
    <Dialog v-model="dialogVisible" title="聯繫人信息">
      <UpdateAddress :addressData="addressData" :idName="addressType" @childEvent="handleChildEvent" />
    </Dialog>
  </div>
</template>

<style scoped></style>
