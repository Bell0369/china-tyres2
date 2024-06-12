export const routesList = [
  {
    path: "/users",
    component: "Layouts",
    redirect: "/users/userlist",
    name: "User",
    meta: {
      authority: "User"
    },
    children: [
      {
        path: "userlist",
        component: "users/UserList",
        name: "UserList",
        meta: {
          title: "用戶管理",
          svgIcon: "user",
          name: "User",
          keepAlive: true,
          authority: "UserList"
        }
      }
    ]
  },
  {
    path: "/client",
    component: "Layouts",
    redirect: "/client/clientlist",
    name: "Client",
    meta: {
      title: "客戶管理",
      authority: "Client"
    },
    children: [
      {
        path: "clientlist",
        component: "client/ClientList",
        name: "ClientList",
        meta: {
          title: "客戶管理",
          svgIcon: "client",
          name: "Client",
          keepAlive: true,
          authority: "ClientList"
        }
      },
      {
        path: "clientitem",
        component: "client/ClientItem",
        name: "ClientItem",
        meta: {
          title: "客戶詳情",
          name: "Client",
          hidden: true,
          authority: "ClientItem"
        }
      }
    ]
  },
  {
    path: "/foreman",
    component: "Layouts",
    redirect: "/foreman/foremanlist",
    name: "Foreman",
    meta: {
      title: "工廠管理",
      authority: "Foreman"
    },
    children: [
      {
        path: "foremanlist",
        component: "foreman/ForemanList",
        name: "ForemanList",
        meta: {
          title: "工廠管理",
          svgIcon: "factory",
          name: "Foreman",
          keepAlive: true,
          authority: "ForemanList"
        }
      },
      {
        path: "foremanitem",
        component: "foreman/ForemanItem",
        name: "ForemanItem",
        meta: {
          title: "工廠詳情",
          name: "Foreman",
          hidden: true,
          authority: "ForemanItem"
        }
      }
    ]
  },
  {
    path: "/order",
    component: "Layouts",
    redirect: "/order/orderlist",
    name: "Order",
    meta: {
      title: "訂單管理",
      authority: "Orders"
    },
    children: [
      {
        path: "orderlist",
        component: "order/OrderList",
        name: "OrderList",
        meta: {
          title: "訂單管理",
          svgIcon: "order",
          keepAlive: true,
          name: "Order",
          authority: "OrdersList"
        }
      },
      {
        path: "orderitem",
        component: "order/OrderItem",
        name: "OrderItem",
        meta: {
          title: "訂單詳情",
          hidden: true,
          name: "Order",
          authority: "OrdersItem"
        }
      },
      {
        path: "orderupload",
        component: "order/OrderUpload",
        name: "OrderUpload",
        meta: {
          title: "上傳訂單",
          hidden: true,
          name: "Order",
          authority: "OrdersUpload"
        }
      }
    ]
  },
  {
    path: "/piorder",
    component: "Layouts",
    redirect: "/piorder/piorderlist",
    name: "PIOrder",
    meta: {
      title: "PI管理",
      authority: "PIOrder"
    },
    children: [
      {
        path: "piorderlist",
        component: "piorder/PIOrderList",
        name: "PIOrderList",
        meta: {
          title: "PI管理",
          svgIcon: "piorder",
          name: "PIOrder",
          keepAlive: true,
          authority: "PIOrderList"
        }
      },
      {
        path: "piorderitem",
        component: "piorder/PIOrderItem",
        name: "PIOrderItem",
        meta: {
          title: "PI詳情",
          name: "PIOrder",
          hidden: true,
          authority: "PIOrderItem"
        }
      },
      {
        path: "piorderupload",
        component: "piorder/PIOrderUpload",
        name: "PIOrderUpload",
        meta: {
          title: "上傳PI",
          name: "PIOrder",
          hidden: true,
          authority: "PIOrderUpload"
        }
      },
      {
        path: "pidelivery",
        component: "piorder/PIDelivery",
        name: "PIDelivery",
        meta: {
          title: "PI發貨計劃",
          name: "PIOrder",
          hidden: true,
          authority: "PIDelivery"
        }
      },
      {
        path: "filedelivery",
        component: "piorder/FileDelivery",
        name: "FileDelivery",
        meta: {
          title: "文件發貨計劃",
          name: "PIOrder",
          hidden: true,
          authority: "FileDelivery"
        }
      }
    ]
  },
  {
    path: "/delivery",
    component: "Layouts",
    redirect: "/delivery/deliverylist",
    name: "Delivery",
    meta: {
      title: "發貨計劃",
      authority: "Delivery"
    },
    children: [
      {
        path: "deliverylist",
        component: "delivery/DeliveryList",
        name: "DeliveryList",
        meta: {
          title: "發貨計劃",
          svgIcon: "delivery",
          name: "Delivery",
          keepAlive: true,
          authority: "DeliveryList"
        }
      },
      {
        path: "deliveryitem",
        component: "delivery/DeliveryItem",
        name: "DeliveryItem",
        meta: {
          title: "發貨計劃詳情",
          name: "Delivery",
          hidden: true,
          authority: "DeliveryItem"
        }
      },
      {
        path: "deliveryupload",
        component: "delivery/DeliveryUpload",
        name: "DeliveryUpload",
        meta: {
          title: "上傳發貨計劃",
          name: "Delivery",
          hidden: true,
          authority: "DeliveryUpload"
        }
      }
    ]
  },
  {
    path: "/invoice",
    component: "Layouts",
    redirect: "/invoice/invoicelist",
    name: "Invoice",
    meta: {
      title: "銷售發票",
      authority: "Invoice"
    },
    children: [
      {
        path: "invoicelist",
        component: "invoice/InvoiceList",
        name: "InvoiceList",
        meta: {
          title: "銷售發票",
          svgIcon: "inventory",
          name: "Invoice",
          keepAlive: true,
          authority: "InvoiceList"
        }
      },
      {
        path: "invoiceitem",
        component: "invoice/InvoiceItem",
        name: "InvoiceItem",
        meta: {
          title: "發票詳情",
          name: "Invoice",
          hidden: true,
          authority: "InvoiceItem"
        }
      }
    ]
  },
  {
    path: "/payment",
    component: "Layouts",
    redirect: "/payment/paymentlist",
    name: "Payment",
    meta: {
      title: "應收應付",
      svgIcon: "payment",
      authority: "Payment"
    },
    children: [
      {
        path: "paymentlist",
        component: "payment/PaymentList",
        name: "PaymentList",
        meta: {
          title: "應收應付",
          name: "Payment",
          authority: "PaymentList"
        }
      },
      {
        path: "prepayments",
        component: "payment/Prepayments",
        name: "Prepayments",
        meta: {
          title: "預付款",
          name: "Payment",
          authority: "Prepayments"
        }
      }
    ]
  },
  {
    path: "/product",
    component: "Layouts",
    redirect: "/product/productlist",
    name: "Product",
    meta: {
      title: "產品管理",
      authority: "Product"
    },
    children: [
      {
        path: "productlist",
        component: "product/ProductList",
        name: "ProductList",
        meta: {
          title: "產品管理",
          svgIcon: "product",
          name: "Product",
          keepAlive: true,
          authority: "ProductList"
        }
      },
      {
        path: "productitem",
        component: "product/ProductItem",
        name: "ProductItem",
        meta: {
          title: "產品詳情",
          name: "Product",
          hidden: true,
          authority: "ProductItem"
        }
      }
    ]
  },
  {
    path: "/configuration",
    component: "Layouts",
    redirect: "/configuration/foremancode",
    name: "Configuration",
    meta: {
      title: "配置項",
      svgIcon: "dashboard",
      authority: "Configuration"
    },
    children: [
      {
        path: "foremancode",
        component: "configuration/ForemanCode",
        name: "ForemanCode",
        meta: {
          name: "Configuration",
          title: "工廠代碼",
          authority: "ForemanCode"
        }
      },
      {
        path: "brand",
        component: "configuration/Brand",
        name: "Brand",
        meta: {
          name: "Configuration",
          title: "品牌",
          authority: "Brand"
        }
      },
      {
        path: "shipping",
        component: "configuration/Shipping",
        name: "Shipping",
        meta: {
          name: "Configuration",
          title: "發貨方式",
          authority: "Shipping"
        }
      }
    ]
  },
  {
    path: "/report",
    component: "Layouts",
    redirect: "/report/index",
    name: "Report",
    meta: {
      title: "統計報表",
      authority: "Report"
    },
    children: [
      {
        path: "index",
        component: "report/index",
        name: "ReportList",
        meta: {
          title: "統計報表2",
          svgIcon: "report",
          name: "Report",
          authority: "ReportList"
        }
      }
    ]
  }
]
