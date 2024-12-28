<script setup>
import { ref, onMounted } from "vue"
import { getInvListApi } from "@/api/order"
import { jsPDF } from "jspdf"

defineOptions({
  name: "ExportTow"
})

// 發票號
const optionsData = ref([])
onMounted(() => {
  getInvListApi({
    page_size: 20
  }).then(({ data }) => {
    optionsData.value = data.data
  })
})

// 選中數據
const inv_no = ref(null)

const jsonData = [
  {
    shippingMarks: "FFAU3766543",
    eanCode: "5420068697038",
    description: "265/35ZR18 97Y XL F205",
    hsCode: "4011100000",
    qty: 70,
    unitPrice: 22.19,
    amount: 1553.3
  },
  {
    shippingMarks: "MSDU5317533",
    eanCode: "5420068697038",
    description: "255/35ZR19 96Y XL F205",
    hsCode: "4011201000",
    qty: 138,
    unitPrice: 26.47,
    amount: 3652.86
  }
  // 更多數據...
]

const exportData = () => {
  const doc = new jsPDF("landscape", "mm", "a4")

  // 添加標題
  doc.setFontSize(14)
  doc.text("CHINA TYRES DISTRIBUTION LIMITED", 14, 15)
  doc.setFontSize(10)
  doc.text("中華輪胎分銷有限公司", 14, 20)
  doc.text("UNIT 3609, LEVEL 36, PCCW TOWER, 979 KING'S ROAD, QUARRY BAY, HONG KONG", 14, 25)
  doc.text("TEL: +852-39781251", 14, 30)

  // 添加發票標題
  doc.setFontSize(12)
  doc.text("INVOICE", 130, 15)

  // 訂單信息
  doc.setFontSize(10)
  doc.text("TO: DELDO AUTOBANDEN", 14, 40)
  doc.text("ESSENSTEENWEG 113", 14, 45)
  doc.text("2930 BRASSCHAAT BELGIUM", 14, 50)

  doc.text("DATE: 2024-12-06", 150, 40)
  doc.text("INVOICE NO.: INV202412-006", 150, 45)

  // 定義表格起始位置
  const startX = 14
  const startY = 60
  const cellHeight = 10

  // 定義列寬
  const colWidths = [30, 40, 50, 30, 20, 30, 30]

  // 表頭
  const headers = [
    "SHIPPING MARKS",
    "EAN CODE",
    "DESCRIPTION OF GOODS",
    "HS CODE",
    "QTY PCS",
    "UNIT PRICE (USD)",
    "AMOUNT (USD)"
  ]

  // 繪製表頭
  let currentY = startY
  let currentX = startX
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  headers.forEach((header, index) => {
    doc.text(header, currentX + 2, currentY + 7)
    doc.rect(currentX, currentY, colWidths[index], cellHeight) // 繪製單元格邊框
    currentX += colWidths[index]
  })

  // 繪製數據行
  doc.setFont("helvetica", "normal")
  currentY += cellHeight

  jsonData.forEach((row) => {
    currentX = startX
    const rowData = [
      row.shippingMarks,
      row.eanCode,
      row.description,
      row.hsCode,
      row.qty.toString(),
      row.unitPrice.toFixed(2),
      row.amount.toFixed(2)
    ]

    rowData.forEach((cell, index) => {
      doc.text(cell, currentX + 2, currentY + 7)
      doc.rect(currentX, currentY, colWidths[index], cellHeight) // 繪製單元格邊框
      currentX += colWidths[index]
    })
    currentY += cellHeight
  })

  // 添加總計信息
  currentY += 5
  doc.setFont("helvetica", "bold")
  doc.text(`FOB VALUE COMMISSION: ${(88541.35).toFixed(2)}`, startX, currentY)
  currentY += 5
  doc.text(`INLAND CHARGE: ${(60.0).toFixed(2)}`, startX, currentY)
  currentY += 5
  doc.text(`TOTAL: ${(89929.47).toFixed(2)}`, startX, currentY)

  // 保存 PDF
  doc.save("invoice.pdf")
}
</script>

<template>
  <el-card shadow="never" class="search-wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-select v-model="inv_no" style="width: 200px" placeholder="請選擇銷售發票號">
          <el-option v-for="item in optionsData" :key="item.id" :label="item.inv_no" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportData">導出銷售發票</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>
