import { OpenAPI } from "@/client/core/OpenAPI"
import { request } from "@/client/core/request"
import type { CancelablePromise } from "@/client/core/CancelablePromise"

export type CategoryPublic = {
  id: number
  name: string
  slug: string
  description?: string | null
}

export type CategoriesPublic = {
  data: CategoryPublic[]
  count: number
}

export type CategoryCreate = Omit<CategoryPublic, "id">
export type CategoryUpdate = CategoryCreate

export type ProductPublic = {
  id: string
  category_id?: number | null
  name: string
  slug: string
  description?: string | null
  price: string
  stock_quantity: number
  weight_grams?: number | null
  image_url?: string | null
  is_active: boolean
  average_rating: string
  benefit?: string | null
  composition?: string | null
  directions?: string | null
  storage_instructions?: string | null
  manufacturer?: string | null
  marketing_location?: string | null
  production_location?: string | null
  regency?: string | null
  licensing?: string | null
  licensing_number?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type ProductsPublic = {
  data: ProductPublic[]
  count: number
}

export type ProductCreate = Omit<
  ProductPublic,
  "id" | "created_at" | "updated_at"
>
export type ProductUpdate = Partial<ProductCreate>

export type CartItemPublic = {
  id: string
  product_id: string
  quantity: number
  product: ProductPublic
  line_total: string
}

export type CartPublic = {
  id: string
  user_id: string
  items: CartItemPublic[]
  subtotal: string
  count: number
}

export type AddressPublic = {
  id: string
  user_id: string
  label?: string | null
  recipient_name: string
  phone_number: string
  address_line: string
  city: string
  province: string
  postal_code: string
  is_main: boolean
}

export type AddressCreate = Omit<AddressPublic, "id" | "user_id">
export type AddressUpdate = Partial<AddressCreate>

export type AddressesPublic = {
  data: AddressPublic[]
  count: number
}

export type CourierPublic = {
  id: number
  code: string
  name: string
  service_type?: string | null
  base_cost: string
}

export type CourierCreate = Omit<CourierPublic, "id">
export type CourierUpdate = Partial<CourierCreate>

export type CouriersPublic = {
  data: CourierPublic[]
  count: number
}

export type OrderItemPublic = {
  id: string
  product_id: string
  quantity: number
  price_at_purchase: string
  product_name: string
}

export type OrderPublic = {
  id: string
  address_id: string
  courier_id: number
  total_items_price: string
  shipping_cost: string
  total_amount: string
  status: string
  payment_method: string
  payment_status: string
  payment_url?: string | null
  paid_at?: string | null
  tracking_number?: string | null
  created_at?: string | null
  items: OrderItemPublic[]
}

export type OrdersPublic = {
  data: OrderPublic[]
  count: number
}

export type AdminOrderUpdate = {
  status?: string | null
  payment_status?: string | null
  tracking_number?: string | null
}

export class MarketplaceService {
  public static readCategories(): CancelablePromise<CategoriesPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/products/categories",
    })
  }

  public static createCategory(
    data: CategoryCreate,
  ): CancelablePromise<CategoryPublic> {
    return request(OpenAPI, {
      method: "POST",
      url: "/api/v1/products/categories",
      body: data,
      mediaType: "application/json",
      errors: { 403: "Not enough privileges", 409: "Conflict", 422: "Validation Error" },
    })
  }

  public static updateCategory(data: {
    categoryId: number
    requestBody: CategoryUpdate
  }): CancelablePromise<CategoryPublic> {
    return request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/products/categories/{category_id}",
      path: { category_id: data.categoryId },
      body: data.requestBody,
      mediaType: "application/json",
      errors: { 403: "Not enough privileges", 404: "Not Found", 409: "Conflict", 422: "Validation Error" },
    })
  }

  public static deleteCategory(categoryId: number): CancelablePromise<{ message: string }> {
    return request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/products/categories/{category_id}",
      path: { category_id: categoryId },
      errors: { 403: "Not enough privileges", 404: "Not Found", 409: "Conflict", 422: "Validation Error" },
    })
  }

  public static readProducts(data: {
    skip?: number
    limit?: number
    categoryId?: number
    search?: string
  }): CancelablePromise<ProductsPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/products/",
      query: {
        skip: data.skip,
        limit: data.limit,
        category_id: data.categoryId,
        search: data.search,
      },
      errors: { 422: "Validation Error" },
    })
  }

  public static readAdminProducts(data: {
    skip?: number
    limit?: number
  } = {}): CancelablePromise<ProductsPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/products/admin",
      query: { skip: data.skip, limit: data.limit },
      errors: { 403: "Not enough privileges", 422: "Validation Error" },
    })
  }

  public static readProduct(productId: string): CancelablePromise<ProductPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/products/{product_id}",
      path: { product_id: productId },
      errors: { 404: "Product not found", 422: "Validation Error" },
    })
  }

  public static createProduct(data: ProductCreate): CancelablePromise<ProductPublic> {
    return request(OpenAPI, {
      method: "POST",
      url: "/api/v1/products/",
      body: data,
      mediaType: "application/json",
      errors: {
        403: "Not enough privileges",
        422: "Validation Error",
      },
    })
  }

  public static updateProduct(data: {
    productId: string
    requestBody: ProductUpdate
  }): CancelablePromise<ProductPublic> {
    return request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/products/{product_id}",
      path: { product_id: data.productId },
      body: data.requestBody,
      mediaType: "application/json",
      errors: { 403: "Not enough privileges", 404: "Not Found", 409: "Conflict", 422: "Validation Error" },
    })
  }

  public static deleteProduct(productId: string): CancelablePromise<ProductPublic> {
    return request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/products/{product_id}",
      path: { product_id: productId },
      errors: { 403: "Not enough privileges", 404: "Not Found", 422: "Validation Error" },
    })
  }

  public static readCart(): CancelablePromise<CartPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/cart/",
    })
  }

  public static addCartItem(data: {
    productId: string
    quantity: number
  }): CancelablePromise<CartPublic> {
    return request(OpenAPI, {
      method: "POST",
      url: "/api/v1/cart/items",
      body: { product_id: data.productId, quantity: data.quantity },
      mediaType: "application/json",
      errors: { 400: "Bad Request", 422: "Validation Error" },
    })
  }

  public static updateCartItem(data: {
    itemId: string
    quantity: number
  }): CancelablePromise<CartPublic> {
    return request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/cart/items/{item_id}",
      path: { item_id: data.itemId },
      body: { quantity: data.quantity },
      mediaType: "application/json",
      errors: { 400: "Bad Request", 404: "Not Found", 422: "Validation Error" },
    })
  }

  public static deleteCartItem(itemId: string): CancelablePromise<CartPublic> {
    return request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/cart/items/{item_id}",
      path: { item_id: itemId },
      errors: { 404: "Not Found", 422: "Validation Error" },
    })
  }

  public static readAddresses(): CancelablePromise<AddressesPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/addresses/",
    })
  }

  public static createAddress(
    data: AddressCreate,
  ): CancelablePromise<AddressPublic> {
    return request(OpenAPI, {
      method: "POST",
      url: "/api/v1/addresses/",
      body: data,
      mediaType: "application/json",
      errors: { 422: "Validation Error" },
    })
  }

  public static updateAddress(data: {
    addressId: string
    requestBody: AddressUpdate
  }): CancelablePromise<AddressPublic> {
    return request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/addresses/{address_id}",
      path: { address_id: data.addressId },
      body: data.requestBody,
      mediaType: "application/json",
      errors: { 404: "Not Found", 422: "Validation Error" },
    })
  }

  public static deleteAddress(addressId: string): CancelablePromise<{ message: string }> {
    return request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/addresses/{address_id}",
      path: { address_id: addressId },
      errors: { 404: "Not Found", 422: "Validation Error" },
    })
  }

  public static readCouriers(): CancelablePromise<CouriersPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/orders/couriers",
    })
  }

  public static createCourier(data: CourierCreate): CancelablePromise<CourierPublic> {
    return request(OpenAPI, {
      method: "POST",
      url: "/api/v1/products/couriers",
      body: data,
      mediaType: "application/json",
      errors: { 403: "Not enough privileges", 409: "Conflict", 422: "Validation Error" },
    })
  }

  public static updateCourier(data: {
    courierId: number
    requestBody: CourierUpdate
  }): CancelablePromise<CourierPublic> {
    return request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/products/couriers/{courier_id}",
      path: { courier_id: data.courierId },
      body: data.requestBody,
      mediaType: "application/json",
      errors: { 403: "Not enough privileges", 404: "Not Found", 409: "Conflict", 422: "Validation Error" },
    })
  }

  public static deleteCourier(courierId: number): CancelablePromise<{ message: string }> {
    return request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/products/couriers/{courier_id}",
      path: { courier_id: courierId },
      errors: { 403: "Not enough privileges", 404: "Not Found", 409: "Conflict", 422: "Validation Error" },
    })
  }

  public static checkout(data: {
    addressId: string
    courierId: number
    paymentMethod: string
  }): CancelablePromise<OrderPublic> {
    return request(OpenAPI, {
      method: "POST",
      url: "/api/v1/orders/checkout",
      body: {
        address_id: data.addressId,
        courier_id: data.courierId,
        payment_method: data.paymentMethod,
      },
      mediaType: "application/json",
      errors: { 400: "Bad Request", 404: "Not Found", 422: "Validation Error" },
    })
  }

  public static readOrders(data: {
    skip?: number
    limit?: number
  } = {}): CancelablePromise<OrdersPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/orders/",
      query: { skip: data.skip, limit: data.limit },
      errors: { 422: "Validation Error" },
    })
  }

  public static readAdminOrders(data: {
    skip?: number
    limit?: number
  } = {}): CancelablePromise<OrdersPublic> {
    return request(OpenAPI, {
      method: "GET",
      url: "/api/v1/orders/admin",
      query: { skip: data.skip, limit: data.limit },
      errors: { 403: "Not enough privileges", 422: "Validation Error" },
    })
  }

  public static updateAdminOrder(data: {
    orderId: string
    requestBody: AdminOrderUpdate
  }): CancelablePromise<OrderPublic> {
    return request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/orders/admin/{order_id}",
      path: { order_id: data.orderId },
      body: data.requestBody,
      mediaType: "application/json",
      errors: { 403: "Not enough privileges", 404: "Not Found", 422: "Validation Error" },
    })
  }

  public static payOrder(orderId: string): CancelablePromise<OrderPublic> {
    return request(OpenAPI, {
      method: "POST",
      url: "/api/v1/orders/{order_id}/pay",
      path: { order_id: orderId },
      errors: { 404: "Not Found", 422: "Validation Error" },
    })
  }
}
