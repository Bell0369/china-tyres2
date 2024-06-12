import { ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"

interface FetchProps {
  api: (params: { id: number; quantity: number | string }) => Promise<any>
}

export function useUpdateQuantity(props: FetchProps) {
  const { api } = props

  const isQuantity = ref(0)

  const handleUpdateQuantity = (row) => {
    ElMessageBox.prompt("", "修改櫃量", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      inputPattern: /^\d+(\.\d+)?$/,
      inputErrorMessage: "請輸入正確數量",
      inputValue: row.quantity
    })
      .then(({ value }) => {
        api({
          id: row.id,
          quantity: value
        }).then(() => {
          ElMessage({
            type: "success",
            message: "操作成功"
          })
          isQuantity.value = row.quantity
        })
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消"
        })
      })
  }

  return {
    isQuantity,
    handleUpdateQuantity
  }
}
