<script setup>
import ExcelJS from "exceljs"

const exportStyledExcel = async () => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("报表")

  // 1. 独占一行的标题，合并 A1:E1，居中
  worksheet.mergeCells("A1:E1")
  const titleCell = worksheet.getCell("A1")
  titleCell.value = "这是报表标题"
  titleCell.alignment = { vertical: "middle", horizontal: "center" }
  titleCell.font = { size: 16, bold: true }

  // 2. 添加表头
  worksheet.addRow(["姓名", "年龄", "性别", "部门", "城市"])

  // 3. 添加数据（模拟）
  const data = [
    { name: "张三", age: 25, gender: "男", dept: "研发部", city: "北京" },
    { name: "李四", age: 30, gender: "女", dept: "市场部", city: "上海" }
  ]

  data.forEach((item) => {
    worksheet.addRow([item.name, item.age, item.gender, item.dept, item.city])
  })

  // 4. 设置列宽
  worksheet.columns.forEach((column) => {
    column.width = 15
  })

  // 5. 导出为 Excel
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  })
  // saveAs(blob, "报表导出.xlsx")
  const url = window.URL.createObjectURL(blob)
  // 创建一个临时的a元素来触发下载
  const a = document.createElement("a")
  a.href = url
  a.download = "报表导出.xlsx"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="app-container">
    <el-button @click="exportStyledExcel">Download Excel</el-button>
  </div>
</template>

<style lang="scss" scoped></style>
