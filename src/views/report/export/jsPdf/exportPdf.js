import { exportInvToPdfApi } from "@/api/order"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import myFont from "../../../../../public/fonts/my-font" //引入字体js文件，解决中文乱码

const centerTexts = [
  "CHINA TYRES DISTRIBUTION LIMITED",
  "中国轮胎销售有限公司",
  "UNIT 3609, LEVEL 36, PCCW TOWER, 979 KING'S ROAD, QUARRY BAY, HONG KONG",
  "TEL: +852-39781251",
  "INVOICE"
]

// a4纸的尺寸[210毫米×297毫米]
const options = {
  // orientation: "landscape",
  unit: "mm",
  format: "a4",
  putOnlyUsedFonts: true,
  floatPrecision: 14
}

const cells1 = 24
const cells2 = 25
const cells3 = 67
const cells4 = 17
const cells5 = 19
const fontSize = 8
const margins = { top: 15, right: 10, bottom: 15, left: 10 }

export const exportDataPdf = async (inv_no, callback) => {
  const { data } = await exportInvToPdfApi({ id: inv_no.id })

  const doc = new jsPDF(options)
  doc.addFileToVFS("ok.ttf", myFont)
  doc.addFont("ok.ttf", "myFont", "normal")

  // 添加標題
  doc.setFontSize(fontSize + 3)
  doc.setFont("helvetica", "bold")
  doc.text(centerTexts[0], setTextCenter(doc, centerTexts[0]), 15)
  doc.setFontSize(fontSize)
  doc.setFont("myFont", "normal")
  doc.text(centerTexts[1], setTextCenter(doc, centerTexts[1]), 21)
  doc.setFont("helvetica", "italic")
  doc.text(centerTexts[2], setTextCenter(doc, centerTexts[2]), 27)
  doc.text(centerTexts[3], setTextCenter(doc, centerTexts[3]), 33)
  doc.setFontSize(fontSize + 3)
  doc.setFont("helvetica", "bold")
  doc.text(centerTexts[4], setTextCenter(doc, centerTexts[4]), 39)

  doc.setFontSize(fontSize)
  const tableInfo1 = [
    ["TO:", data.to[0], "DATE:", data.date],
    ["", data.to[1], "INVOICE NO.:", data.inv_no],
    ["", data.to[2], "PO NO.:", data.po_no],
    ["", data.to[3]],
    ["", data.to[4]],
    ["", data.to[5]]
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
      1: { cellWidth: cells2 + cells3 },
      2: { cellWidth: cells4 + cells5 },
      3: { cellWidth: cells5 * 2 }
    }
  })
  let tops1 = 60 + 20
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
    ["SHIPPING", "EAN CODE", "DESCRIPTION OF GOODS", "QTY.", "UNIT PRICE", "AMOUNT"],
    ["MARKS", "", data.describe_str, "PCS", "(USD)", "(USD)"]
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
      2: { halign: "left", cellWidth: cells3 + cells4 },
      3: { halign: "center", cellWidth: cells5 },
      4: { halign: "center", cellWidth: cells5 },
      5: { halign: "center", cellWidth: cells5 }
    }
  })

  // 添加表格-海關代碼
  autoTable(doc, {
    body: tableData1(data.customs_code),
    startY: doc.lastAutoTable.finalY + 2,
    styles: {
      fontSize: fontSize, // 字体大小
      cellPadding: 1 // 单元格内边距
    },
    margin: margins,
    theme: "plain",
    columnStyles: {
      0: { halign: "center", cellWidth: cells1 },
      1: { halign: "left", cellWidth: cells2 },
      2: { halign: "right", cellWidth: cells3 },
      3: { halign: "center", cellWidth: cells4 },
      4: { halign: "center", cellWidth: cells5 },
      5: { halign: "right", cellWidth: cells5 * 2 }
    }
  })

  // 添加表格 - 装箱单
  autoTable(doc, {
    body: tableData(data.product_info),
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
      3: { halign: "center", cellWidth: cells4 },
      4: { halign: "center", cellWidth: cells5 },
      5: { halign: "center", cellWidth: cells5 },
      6: { halign: "center", cellWidth: cells5 }
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
    startY: doc.lastAutoTable.finalY,
    styles: {
      fontSize: fontSize,
      cellPadding: 1
    },
    margin: margins,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: cells1 },
      1: { cellWidth: cells2 + cells3 },
      2: { halign: "right", cellWidth: cells4 + cells5 },
      3: { halign: "right", cellWidth: cells5 * 2 }
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
    startY: doc.lastAutoTable.finalY + 10,
    styles: {
      fontSize: fontSize,
      cellPadding: 1
    },
    margin: margins,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: cells1 + cells4 },
      1: { cellWidth: cells3 + cells2 + cells5 * 3 }
    }
  })

  autoTable(doc, {
    body: shippedType(data.shipped_type),
    startY: doc.lastAutoTable.finalY + 10,
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
    const footerText = `第${i}页-共${pageCount}页`
    doc.text(footerText, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, {
      align: "center"
    })
  }

  // 保存 PDF
  if (inv_no.shipped_type === "WH" || inv_no.shipped_type === "DIR") {
    const factoryName = inv_no.factory_name.join("-")
    doc.save(`${inv_no.inv_no}-${inv_no.quantity}X40HQ-${factoryName}-${inv_no.client_code}.pdf`)
  } else {
    doc.save(`${inv_no.inv_no}-${inv_no.quantity}X40HQ-${inv_no.client_code}.pdf`)
  }

  callback()
}

// 表格数据转换函数 - 海關代碼
const tableData1 = (data) => {
  const tableData = []
  for (let i = 0; i < data.length; i++) {
    tableData.push(["", data[i].title, data[i].code, "", data[i].code_number, data[i].total_prices.toFixed(2)])
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
    // tableData.push([
    //   { content: category, rowSpan: items.length },
    //   items[0].ean,
    //   items[0].product_name,
    //   items[0].brand,
    //   items[0].number,
    //   items[0].unit_price,
    //   items[0].total_price
    // ])
    for (let i = 0; i < items.length; i++) {
      tableData.push([
        i === 0 ? category : "",
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

// 出貨類型判斷
const shippedType = (type) => {
  if (type === "WH") {
    return [["WAREHOUSE ORDER"], ["ALL TYRES MENTIONED ON THIS INVOICE ARE MADE IN CHINA"]]
  } else if (type === "DIR") {
    return [["DIRECT ORDER"], ["ALL TYRES MENTIONED ON THIS INVOICE ARE MADE IN CHINA"]]
  } else {
    return []
  }
}

// 文本居中的x轴距离
const setTextCenter = (doc, text) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const textWidth = doc.getTextWidth(text)
  const x = (pageWidth - textWidth) / 2
  return x
}
