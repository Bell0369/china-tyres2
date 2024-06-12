import { type RouteRecordRaw, createRouter } from "vue-router"
import { history, flatMultiLevelRoutes } from "./helper"
import routeSettings from "@/config/route"

const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    name: "Home",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          svgIcon: "home",
          name: "Home",
          affix: true
        }
      },
      {
        path: "updatepassword",
        component: () => import("@/views/dashboard/UpdatePassword.vue"),
        name: "UpdatePassword",
        meta: {
          title: "修改密碼",
          hidden: true
        }
      }
    ]
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/users",
    component: Layouts,
    redirect: "/users/userlist",
    name: "User",
    meta: {
      roles: ["userList"]
    },
    children: [
      {
        path: "userlist",
        component: () => import("@/views/users/UserList.vue"),
        name: "UserList",
        meta: {
          title: "用戶管理",
          svgIcon: "user",
          name: "User",
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/client",
    component: Layouts,
    redirect: "/client/clientlist",
    name: "Client",
    meta: {
      title: "客戶管理",
      roles: ["clientList"]
    },
    children: [
      {
        path: "clientlist",
        component: () => import("@/views/client/ClientList.vue"),
        name: "ClientList",
        meta: {
          title: "客戶管理",
          svgIcon: "client",
          name: "Client",
          keepAlive: true
        }
      },
      {
        path: "clientitem",
        component: () => import("@/views/client/ClientItem.vue"),
        name: "ClientItem",
        meta: {
          title: "客戶詳情",
          name: "Client",
          hidden: true,
          roles: ["clientShow"]
        }
      }
    ]
  },
  {
    path: "/foreman",
    component: Layouts,
    redirect: "/foreman/foremanlist",
    name: "Foreman",
    meta: {
      title: "工廠管理",
      roles: ["factoryList"]
    },
    children: [
      {
        path: "foremanlist",
        component: () => import("@/views/foreman/ForemanList.vue"),
        name: "ForemanList",
        meta: {
          title: "工廠管理",
          svgIcon: "factory",
          name: "Foreman",
          keepAlive: true
        }
      },
      {
        path: "foremanitem",
        component: () => import("@/views/foreman/ForemanItem.vue"),
        name: "ForemanItem",
        meta: {
          title: "工廠詳情",
          name: "Foreman",
          hidden: true,
          roles: ["factoryBasicInfo"]
        }
      }
    ]
  },
  {
    path: "/order",
    component: Layouts,
    redirect: "/order/orderlist",
    name: "Order",
    meta: {
      title: "訂單管理",
      roles: ["orderList"]
    },
    children: [
      {
        path: "orderlist",
        component: () => import("@/views/order/OrderList.vue"),
        name: "OrderList",
        meta: {
          title: "訂單管理",
          svgIcon: "order",
          keepAlive: true,
          name: "Order"
        }
      },
      {
        path: "orderitem",
        component: () => import("@/views/order/OrderItem.vue"),
        name: "OrderItem",
        meta: {
          title: "訂單詳情",
          hidden: true,
          name: "Order",
          roles: ["orderDetail"]
        }
      },
      {
        path: "orderupload",
        component: () => import("@/views/order/OrderUpload.vue"),
        name: "OrderUpload",
        meta: {
          title: "上傳訂單",
          hidden: true,
          name: "Order",
          roles: ["uploadOrder"]
        }
      }
    ]
  },
  {
    path: "/piorder",
    component: Layouts,
    redirect: "/piorder/piorderlist",
    name: "PIOrder",
    meta: {
      title: "PI管理",
      roles: ["piList"]
    },
    children: [
      {
        path: "piorderlist",
        component: () => import("@/views/piorder/PIOrderList.vue"),
        name: "PIOrderList",
        meta: {
          title: "PI管理",
          svgIcon: "piorder",
          name: "PIOrder",
          keepAlive: true
        }
      },
      {
        path: "piorderitem",
        component: () => import("@/views/piorder/PIOrderItem.vue"),
        name: "PIOrderItem",
        meta: {
          title: "PI詳情",
          name: "PIOrder",
          hidden: true,
          roles: ["piBasicDetail"]
        }
      },
      {
        path: "piorderupload",
        component: () => import("@/views/piorder/PIOrderUpload.vue"),
        name: "PIOrderUpload",
        meta: {
          title: "上傳PI",
          name: "PIOrder",
          hidden: true,
          roles: ["uploadPi"]
        }
      },
      {
        path: "pidelivery",
        component: () => import("@/views/piorder/PIDelivery.vue"),
        name: "PIDelivery",
        meta: {
          title: "PI發貨計劃",
          name: "PIOrder",
          hidden: true,
          roles: ["uploadDeliveryPlan"]
        }
      },
      {
        path: "filedelivery",
        component: () => import("@/views/piorder/FileDelivery.vue"),
        name: "FileDelivery",
        meta: {
          title: "文件發貨計劃",
          name: "PIOrder",
          hidden: true,
          roles: ["uploadDeliveryPlan"]
        }
      }
    ]
  },
  {
    path: "/delivery",
    component: Layouts,
    redirect: "/delivery/deliverylist",
    name: "Delivery",
    meta: {
      title: "發貨計劃",
      roles: ["deliveryPlanList"]
    },
    children: [
      {
        path: "deliverylist",
        component: () => import("@/views/delivery/DeliveryList.vue"),
        name: "DeliveryList",
        meta: {
          title: "發貨計劃",
          svgIcon: "delivery",
          name: "Delivery",
          keepAlive: true
        }
      },
      {
        path: "deliveryitem",
        component: () => import("@/views/delivery/DeliveryItem.vue"),
        name: "DeliveryItem",
        meta: {
          title: "發貨計劃詳情",
          name: "Delivery",
          hidden: true,
          roles: ["deliveryPlanDetails"]
        }
      },
      {
        path: "deliveryupload",
        component: () => import("@/views/delivery/DeliveryUpload.vue"),
        name: "DeliveryUpload",
        meta: {
          title: "上傳裝箱單",
          name: "Delivery",
          hidden: true,
          roles: ["uploadPackingList"]
        }
      }
    ]
  },
  {
    path: "/invoice",
    component: Layouts,
    redirect: "/invoice/invoicelist",
    name: "Invoice",
    meta: {
      title: "銷售發票",
      roles: ["invList"]
    },
    children: [
      {
        path: "invoicelist",
        component: () => import("@/views/invoice/InvoiceList.vue"),
        name: "InvoiceList",
        meta: {
          title: "銷售發票",
          svgIcon: "inventory",
          name: "Invoice",
          keepAlive: true
        }
      },
      {
        path: "invoiceitem",
        component: () => import("@/views/invoice/InvoiceItem.vue"),
        name: "InvoiceItem",
        meta: {
          title: "發票詳情",
          name: "Invoice",
          hidden: true,
          roles: ["invDetail", "editInv"]
        }
      }
    ]
  },
  {
    path: "/payment",
    component: Layouts,
    redirect: "/payment/paymentlist",
    name: "Payment",
    meta: {
      title: "應收應付",
      svgIcon: "payment",
      alwaysShow: true,
      roles: ["clientProceeds", "clientAdvancePayment"]
    },
    children: [
      {
        path: "paymentlist",
        component: () => import("@/views/payment/PaymentList.vue"),
        name: "PaymentList",
        meta: {
          title: "應收應付",
          name: "Payment",
          keepAlive: true,
          roles: ["clientProceeds"]
        }
      },
      {
        path: "prepayments",
        component: () => import("@/views/payment/Prepayments.vue"),
        name: "Prepayments",
        meta: {
          title: "預付款",
          name: "Payment",
          keepAlive: true,
          roles: ["clientAdvancePayment"]
        }
      }
    ]
  },
  {
    path: "/product",
    component: Layouts,
    redirect: "/product/productlist",
    name: "Product",
    meta: {
      title: "產品管理",
      roles: ["productList"]
    },
    children: [
      {
        path: "productlist",
        component: () => import("@/views/product/ProductList.vue"),
        name: "ProductList",
        meta: {
          title: "產品管理",
          svgIcon: "product",
          name: "Product",
          keepAlive: true
        }
      },
      {
        path: "productitem",
        component: () => import("@/views/product/ProductItem.vue"),
        name: "ProductItem",
        meta: {
          title: "產品詳情",
          name: "Product",
          hidden: true,
          roles: ["productShow"]
        }
      }
    ]
  },
  {
    path: "/configuration",
    component: Layouts,
    redirect: "/configuration/foremancode",
    name: "Configuration",
    meta: {
      title: "配置項",
      svgIcon: "dashboard",
      roles: ["config"]
    },
    children: [
      {
        path: "foremancode",
        component: () => import("@/views/configuration/ForemanCode.vue"),
        name: "ForemanCode",
        meta: {
          name: "Configuration",
          title: "工廠代碼"
        }
      },
      {
        path: "brand",
        component: () => import("@/views/configuration/Brand.vue"),
        name: "Brand",
        meta: {
          name: "Configuration",
          title: "品牌"
        }
      },
      {
        path: "shipping",
        component: () => import("@/views/configuration/Shipping.vue"),
        name: "Shipping",
        meta: {
          name: "Configuration",
          title: "發貨方式"
        }
      },
      {
        path: "paymentterms",
        component: () => import("@/views/configuration/PaymentTerms.vue"),
        name: "PaymentTerms",
        meta: {
          name: "Configuration",
          title: "付款條件"
        }
      }
    ]
  },
  {
    path: "/report",
    component: Layouts,
    redirect: "/report/statistics",
    name: "Report",
    meta: {
      title: "統計報表",
      svgIcon: "report",
      roles: ["report"]
    },
    children: [
      {
        path: "statistics",
        component: () => import("@/views/report/Statistics.vue"),
        name: "Statistics",
        meta: {
          title: "統計分析",
          name: "Report",
          roles: ["statisticSalesVolume"],
          keepAlive: true
        }
      },
      {
        path: "export",
        component: () => import("@/views/report/Export.vue"),
        name: "Export",
        meta: {
          name: "Report",
          title: "數據導出"
        }
      }
    ]
  }
]

const router = createRouter({
  history,
  routes: routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
