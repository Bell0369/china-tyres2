import { exportInvToPdfApi } from "@/api/order"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import myFont from "../../../../public/fonts/my-font" //引入字体js文件，解决中文乱码

const centerTexts = [
  "CHINA TYRES DISTRIBUTION LIMITED",
  "中国轮胎销售有限公司",
  "UNIT 3609, LEVEL 36, PCCW TOWER, 979 KING'S ROAD, QUARRY BAY, HONG KONG",
  "TEL: +852-39781251",
  "INVOICE"
]

// a4纸的尺寸[210毫米×297毫米]
const options = {
  orientation: "landscape",
  unit: "mm",
  format: "a4",
  putOnlyUsedFonts: true,
  floatPrecision: 14
}

export const exportDataPdf = async (inv_no, callback) => {
  const { data } = await exportInvToPdfApi({ id: inv_no.id })

  const doc = new jsPDF(options)
  doc.addFileToVFS("ok.ttf", myFont)
  doc.addFont("ok.ttf", "myFont", "normal")
  doc.setFontSize(10)
  // 添加標題
  doc.text(centerTexts[0], setTextCenter(doc, centerTexts[0]), 20)
  doc.setFont("myFont")
  doc.text(centerTexts[1], setTextCenter(doc, centerTexts[1]), 26)
  doc.setFont("helvetica", "italic")
  doc.text(centerTexts[2], setTextCenter(doc, centerTexts[2]), 32)
  doc.text(centerTexts[3], setTextCenter(doc, centerTexts[3]), 38)
  doc.setFont("helvetica", "normal")
  doc.text(centerTexts[4], setTextCenter(doc, centerTexts[4]), 44)

  const tableInfo1 = [
    ["TO:", data.to[0], "DATE:", data.date],
    ["", data.to[1], "INVOICE NO.:", data.inv_no],
    ["", data.to[2], "PO NO.:", data.po_no]
  ]
  autoTable(doc, {
    body: tableInfo1,
    startY: 50,
    styles: {
      fontSize: 10,
      cellPadding: 1
    },
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 140 },
      2: { cellWidth: 32 },
      3: { cellWidth: 50 }
    }
  })
  let tops1 = tableInfo1.length * 8 + 50
  doc.text(
    "************************************************************************************************************************************************************************************",
    15,
    tops1
  )
  tops1 = tops1 + 5
  doc.text(data.destination, 15, tops1)
  tops1 = tops1 + 8
  doc.text(
    "************************************************************************************************************************************************************************************",
    15,
    tops1
  )
  // 商品描述
  tops1 = tops1 + 3
  const tableInfo2 = [
    ["SHIPPING", "EAN CODE", "DESCRIPTION OF GOODS", "QTY.", "UNIT PRICE", "AMOUNT"],
    ["MARKS", "", data.describe_str, "PCS", "(USD)", "(USD)"]
  ]
  autoTable(doc, {
    body: tableInfo2,
    startY: tops1,
    styles: {
      fontSize: 10,
      cellPadding: 1
    },
    theme: "plain",
    columnStyles: {
      0: { halign: "center", cellWidth: 40 },
      1: { halign: "center", cellWidth: 37 },
      2: { halign: "left", cellWidth: 112 },
      4: { halign: "center", cellWidth: 25 },
      5: { halign: "center", cellWidth: 25 },
      6: { halign: "center", cellWidth: 28 }
    }
  })

  // 添加表格-海關代碼
  autoTable(doc, {
    body: tableData1(data.customs_code),
    startY: doc.lastAutoTable.finalY + 5,
    styles: {
      fontSize: 10, // 字体大小
      cellPadding: 1 // 单元格内边距
    },
    theme: "plain",
    columnStyles: {
      0: { halign: "center", cellWidth: 40 },
      1: { halign: "left", cellWidth: 37 },
      2: { halign: "right", cellWidth: 90 },
      3: { halign: "right", cellWidth: 47 },
      4: { halign: "right", cellWidth: 53 }
    }
  })

  // 添加表格 - 装箱单
  autoTable(doc, {
    body: tableData(data.product_info),
    startY: doc.lastAutoTable.finalY + 2,
    styles: {
      fontSize: 9,
      cellPadding: 2
    },
    theme: "grid",
    columnStyles: {
      0: { halign: "center", valign: "middle", cellWidth: 40 },
      1: { halign: "center", cellWidth: 37 },
      2: { halign: "left", cellWidth: 90 },
      3: { halign: "center", cellWidth: 22 },
      4: { halign: "right", cellWidth: 25 },
      5: { halign: "right", cellWidth: 25 },
      6: { halign: "right", cellWidth: 28 }
    }
  })

  // 添加表格 - 总计
  const tableInfo3 = [["", "FOB VALUE", "", data.fob_value.toFixed(2)]]
  if (data.commission > 0) {
    tableInfo3.push(["", "COMMISSION", "", data.commission])
  }
  tableInfo3.push(...tableData2(data.inv_extra_fee_json))
  tableInfo3.push(["", "TOTAL: 4 X40 HQ", data.total_number, data.end_price.toFixed(2)])
  autoTable(doc, {
    body: tableInfo3,
    startY: doc.lastAutoTable.finalY + 2,
    styles: {
      fontSize: 10, // 字体大小
      cellPadding: 1 // 单元格内边距
    },
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 127 },
      2: { halign: "right", cellWidth: 47 },
      3: { halign: "right", cellWidth: 53 }
    }
  })

  const tableInfo4 = [
    ["Payment Term:", data.payment_term],
    ["Deposit paid:", data.deposit_paid],
    ["Payable Balance:", data.payable_balance],
    ["Due date:", data.due_date],
    ["Client Code:", data.client_code],
    ["Banking Info:", data.banking_info],
    ["Advising Bank:", data.advising_bank],
    ["Account no.:", data.account_no],
    ["SWIFT code:", data.swift_code],
    ["Bank address:", data.bank_address]
  ]
  autoTable(doc, {
    body: tableInfo4,
    startY: doc.lastAutoTable.finalY + 15,
    styles: {
      fontSize: 10,
      cellPadding: 1
    },
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 227 }
    }
  })

  const tops = doc.lastAutoTable.finalY + 20
  doc.text(data.client_code, 15, tops)
  doc.text("DIRECT ORDER", 15, tops + 5)
  doc.text("ALL TYRES MENTIONED ON THIS INVOICE ARE MADE IN CHINA", 15, tops + 10)

  // 保存 PDF
  if (inv_no.shipped_type === "WH" || inv_no.shipped_type === "DIR") {
    doc.save(`${inv_no.inv_no}-${inv_no.quantity}X40HQ-${inv_no.factory_name}-${inv_no.client_code}.pdf`)
  } else {
    doc.save(`${inv_no.inv_no}-${inv_no.quantity}X40HQ-${inv_no.client_code}.pdf`)
  }

  callback()
}

// 表格数据转换函数 - 海關代碼
const tableData1 = (data) => {
  const tableData = []
  for (let i = 0; i < data.length; i++) {
    tableData.push(["", data[i].title, data[i].code, data[i].code_number, data[i].total_prices])
  }
  return tableData
}

// 表格数据转换函数 - 海關代碼
const tableData2 = (data) => {
  const tableData = []
  for (let i = 0; i < data.length; i++) {
    tableData.push(["", data[i].title, "", data[i].price])
  }
  return tableData
}
// 表格数据转换函数 - 装箱单
const tableData = (data) => {
  const tableData = []
  for (const [category, items] of Object.entries(data)) {
    // 第一列内容需要合并
    tableData.push([
      { content: category, rowSpan: items.length },
      items[0].ean,
      items[0].product_name,
      items[0].brand,
      items[0].number,
      items[0].unit_price,
      items[0].total_price
    ])
    for (let i = 1; i < items.length; i++) {
      tableData.push([
        items[i].ean,
        items[i].product_name,
        items[i].brand,
        items[i].number,
        items[i].unit_price,
        items[i].total_price
      ])
    }
  }
  return tableData
}

// 文本居中的x轴距离
const setTextCenter = (doc, text) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const textWidth = doc.getTextWidth(text)
  const x = (pageWidth - textWidth) / 2
  return x
}
