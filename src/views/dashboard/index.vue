<script setup>
import { ref } from "vue"
import { useUserStore } from "@/store/modules/user"

const { userinfo } = useUserStore()

const value = ref(new Date())
// const isAdmin = userStore.roles.includes("admin")
</script>

<template>
  <div class="app-container">
    <el-card class="mb5">
      <el-row :gutter="20">
        <el-col :xs="24" :lg="24" :xl="12">
          <el-descriptions title="個人信息" direction="vertical" :column="4" size="large" border class="mb10">
            <el-descriptions-item label="用戶名">{{ userinfo.username }}</el-descriptions-item>
            <el-descriptions-item label="電郵">{{ userinfo.email }}</el-descriptions-item>
            <el-descriptions-item label="電話">{{ userinfo.phone }}</el-descriptions-item>
            <el-descriptions-item label="部門">{{ userinfo.role_name }}</el-descriptions-item>
            <el-descriptions-item label="性別">
              {{ userinfo.sex ? (userinfo.sex === 1 ? "男" : "女") : "未知" }}
            </el-descriptions-item>
            <el-descriptions-item label="備註">{{ userinfo.remarks }} </el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :xs="24" :lg="24" :xl="12">
          <el-calendar v-model="value" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
