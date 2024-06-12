<script setup>
import { ref, defineEmits } from "vue"
import { UploadFilled } from "@element-plus/icons-vue"
import { ElMessage, genFileId } from "element-plus"

const emits = defineEmits(["setUploadXlsx"])

// 文件上传格式判断
// const fromFile = ref()
const uploadRef = ref()
const uploadFile = (file) => {
  const typeArray = [".xlsx"]
  const fileName = file.name
  const fileExtension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase()
  if (!typeArray.includes(fileExtension)) {
    ElMessage.warning("上传文件格式仅支持.xlsx格式")
    uploadRef.value.clearFiles()
    // fromFile.value = ""
    return false
  }
  // fromFile.value = file.raw
  emits("setUploadXlsx", file.raw)
}

// 超出覆盖
const handleExceed = (files) => {
  uploadRef.value.clearFiles()
  const file = files[0]
  file.uid = genFileId()
  uploadRef.value.handleStart(file)
}
</script>

<template>
  <el-upload
    ref="uploadRef"
    class="upload-demo"
    drag
    action="/"
    multiple
    accept=".xlsx"
    :limit="1"
    :auto-upload="false"
    :on-change="uploadFile"
    :on-exceed="handleExceed"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      點擊或將文件拖拽此處上傳
      <p class="c-bluegray">僅支持.xlsx格式</p>
    </div>
  </el-upload>
</template>

<style scoped></style>
