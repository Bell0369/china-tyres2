import { exportPackingListToPdfApi } from "@/api/order"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import myFont from "../../../../../public/fonts/my-font" //引入字体js文件，解决中文乱码

const centerTexts = [
  "CHINA TYRES DISTRIBUTION LIMITED",
  "中国轮胎销售有限公司",
  "UNIT 3609, LEVEL 36, PCCW TOWER, 979 KING'S ROAD, QUARRY BAY, HONG KONG",
  "TEL: +852-39781251",
  "PACKING LIST"
]

// a4纸的尺寸[210毫米×297毫米]
const options = {
  // orientation: "landscape",
  unit: "mm",
  format: "a4",
  putOnlyUsedFonts: true,
  floatPrecision: 14
}

const cells1 = 23
const cells2 = 25
const cells3 = 17
const cells4 = 64
const cells5 = 17
const cells6 = 14
const cells7 = 15

const fontSize = 7
const margins = { top: 15, right: 10, bottom: 15, left: 10 }

export const exportDataPdfPacking = async (inv_no, callback) => {
  const { data } = await exportPackingListToPdfApi({ id: inv_no.id })

  const doc = new jsPDF(options)
  doc.addFileToVFS("ok.ttf", myFont)
  doc.addFont("ok.ttf", "myFont", "normal")
  // 添加標題
  doc.setFontSize(fontSize + 4)
  doc.setFont("helvetica", "bold")
  doc.text(centerTexts[0], setTextCenter(doc, centerTexts[0]), 15)
  doc.setFontSize(fontSize + 1)
  doc.setFont("myFont", "normal")
  doc.text(centerTexts[1], setTextCenter(doc, centerTexts[1]), 21)
  doc.setFont("helvetica", "italic")
  doc.text(centerTexts[2], setTextCenter(doc, centerTexts[2]), 27)
  doc.text(centerTexts[3], setTextCenter(doc, centerTexts[3]), 33)
  doc.setFontSize(fontSize + 4)
  doc.setFont("helvetica", "bold")
  doc.text(centerTexts[4], setTextCenter(doc, centerTexts[4]), 39)

  doc.setFontSize(fontSize)
  const tableInfo1 = [
    ["TO:", data.to[0], "DATE:", data.date],
    ["", data.to[1], "INVOICE NO.:", data.inv_no],
    ["", data.to[2], "PO NO.:", data.po_no]
  ]
  autoTable(doc, {
    body: tableInfo1,
    startY: 45,
    styles: {
      fontSize: fontSize,
      cellPadding: 1
    },
    margin: margins,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: cells1 },
      1: { cellWidth: cells2 + cells3 + cells4 },
      2: { cellWidth: cells5 + cells6 },
      3: { cellWidth: cells7 * 2 }
    }
  })
  let tops1 = 45 + 20
  doc.text(
    "***************************************************************************************************************************************************************************",
    margins.left,
    tops1
  )
  tops1 = tops1 + 5
  doc.text(data.destination, margins.left, tops1)
  tops1 = tops1 + 5
  doc.text(
    "***************************************************************************************************************************************************************************",
    margins.left,
    tops1
  )
  // 商品描述
  const tableInfo2 = [
    ["SHIPPING", "EAN CODE", "ART NR", "DESCRIPTION OF GOODS", "QTY.", "NET/W", "GROSS/W"],
    ["MARKS", "", "", data.describe_str, "PCS", "(KGS)", "(KGS)"]
  ]
  autoTable(doc, {
    body: tableInfo2,
    startY: tops1,
    styles: {
      fontSize: fontSize,
      cellPadding: 1
    },
    margin: margins,
    theme: "plain",
    columnStyles: {
      0: { halign: "center", cellWidth: cells1 },
      1: { halign: "center", cellWidth: cells2 },
      2: { halign: "center", cellWidth: cells3 },
      3: { halign: "left", cellWidth: cells4 + cells5 },
      4: { halign: "center", cellWidth: cells6 },
      5: { halign: "center", cellWidth: cells7 },
      6: { halign: "center", cellWidth: cells7 }
    }
  })

  // 添加表格 - 装箱单
  autoTable(doc, {
    body: tableData(data),
    startY: doc.lastAutoTable.finalY + 1,
    styles: {
      fontSize: 7,
      cellPadding: 1
    },
    margin: margins,
    theme: "grid",
    columnStyles: {
      0: { halign: "center", valign: "middle", cellWidth: cells1, fontStyle: "bold", textColor: "#000000" },
      1: { halign: "center", cellWidth: cells2 },
      2: { halign: "left", cellWidth: cells3 },
      3: { halign: "left", cellWidth: cells4 },
      4: { halign: "left", cellWidth: cells5 },
      5: { halign: "center", valign: "middle", cellWidth: cells6 },
      6: { halign: "center", valign: "middle", cellWidth: cells7, fontStyle: "bold" },
      7: { halign: "center", valign: "middle", cellWidth: cells7, fontStyle: "bold" }
    }
  })

  autoTable(doc, {
    // body: shippedType(data.shipped_type),
    body: data.made_in.map((item) => [item]),
    startY: doc.lastAutoTable.finalY + 3,
    styles: {
      fontSize: fontSize,
      cellPadding: 1
    },
    margin: margins,
    theme: "plain"
  })

  // 手动添加页码
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i) // 设置当前页
    doc.setFont("myFont")
    const footerText = `page ${i} of ${pageCount}`
    doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, {
      align: "center"
    })
  }

  // 保存 PDF
  const InvNo = inv_no.inv_no.slice(3)
  if (inv_no.shipped_type === "WH" || inv_no.shipped_type === "DIR") {
    const factoryName = inv_no.factory_name.join("-")
    doc.save(`PL${InvNo}-${inv_no.quantity}X40HQ-${factoryName}-${inv_no.client_code}.pdf`)
  } else {
    doc.save(`PL${InvNo}-${inv_no.quantity}X40HQ-${inv_no.client_code}.pdf`)
  }

  callback()
}

// 表格数据转换函数 - 装箱单
const tableData = (data) => {
  const tableData = []
  let weights = 0
  for (const [category, items] of Object.entries(data.product_info)) {
    for (let i = 0; i < items.length; i++) {
      tableData.push([
        i === 0 ? category : "",
        items[i].ean,
        items[i].art,
        items[i].product_name,
        items[i].brand,
        items[i].number,
        i === 0 ? items[0].weight : "",
        i === 0 ? items[0].weight : ""
        // { content: i === 0 ? items[0].weight : "", rowSpan: items.length },
        // { content: i === 0 ? items[0].weight : "", rowSpan: items.length }
      ])
    }
    weights += parseFloat(items[0].weight)
  }
  tableData.push([{ content: `TOTAL: ${data.quantity} X40 HQ`, colSpan: 5 }, data.total_number, weights, weights])
  return tableData
}

// 出貨類型判斷
// const shippedType = (type) => {
//   if (type === "WH") {
//     return [["WAREHOUSE ORDER"], ["ALL TYRES MENTIONED ON THIS INVOICE ARE MADE IN CHINA"]]
//   } else if (type === "DIR") {
//     return [["DIRECT ORDER"], ["ALL TYRES MENTIONED ON THIS INVOICE ARE MADE IN CHINA"]]
//   } else {
//     return []
//   }
// }

// 文本居中的x轴距离
const setTextCenter = (doc, text) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const textWidth = doc.getTextWidth(text)
  const x = (pageWidth - textWidth) / 2
  return x
}
