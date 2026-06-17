import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit3, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import type {
  CategoryPublic,
  CourierCreate,
  CourierPublic,
  OrderPublic,
  ProductPublic,
  ProductUpdate,
} from "@/client/marketplace"
import { MarketplaceService } from "@/client/marketplace"
import { formatCurrency } from "@/components/Marketplace/format"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const emptyCourier: CourierCreate = {
  code: "",
  name: "",
  service_type: "",
  base_cost: "15000",
}

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

function CategoryManager() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: MarketplaceService.readCategories,
  })
  const [editing, setEditing] = useState<CategoryPublic | null>(null)
  const updateMutation = useMutation({
    mutationFn: (category: CategoryPublic) =>
      MarketplaceService.updateCategory({
        categoryId: category.id,
        requestBody: {
          name: category.name,
          slug: category.slug,
          description: category.description || null,
        },
      }),
    onSuccess: () => {
      showSuccessToast("Kategori diperbarui")
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: handleError.bind(showErrorToast),
  })
  const deleteMutation = useMutation({
    mutationFn: MarketplaceService.deleteCategory,
    onSuccess: () => {
      showSuccessToast("Kategori dihapus")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-3">
            <Input
              value={editing.name}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  name: event.target.value,
                  slug: slugify(event.target.value),
                })
              }
            />
            <Input value={editing.slug} readOnly />
            <Input
              value={editing.description || ""}
              onChange={(event) =>
                setEditing({ ...editing, description: event.target.value })
              }
            />
            <div className="flex gap-2 md:col-span-3">
              <Button
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate(editing)}
              >
                <Save />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setEditing(category)}
                    >
                      <Edit3 />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(category.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function CourierManager() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { data } = useQuery({
    queryKey: ["couriers"],
    queryFn: MarketplaceService.readCouriers,
  })
  const [form, setForm] = useState<CourierCreate>(emptyCourier)
  const [editingId, setEditingId] = useState<number | null>(null)
  const createMutation = useMutation({
    mutationFn: MarketplaceService.createCourier,
    onSuccess: () => {
      showSuccessToast("Kurir ditambahkan")
      setForm(emptyCourier)
      queryClient.invalidateQueries({ queryKey: ["couriers"] })
    },
    onError: handleError.bind(showErrorToast),
  })
  const updateMutation = useMutation({
    mutationFn: (courier: CourierCreate) =>
      MarketplaceService.updateCourier({
        courierId: editingId || 0,
        requestBody: courier,
      }),
    onSuccess: () => {
      showSuccessToast("Kurir diperbarui")
      setEditingId(null)
      setForm(emptyCourier)
      queryClient.invalidateQueries({ queryKey: ["couriers"] })
    },
    onError: handleError.bind(showErrorToast),
  })
  const deleteMutation = useMutation({
    mutationFn: MarketplaceService.deleteCourier,
    onSuccess: () => {
      showSuccessToast("Kurir dihapus")
      queryClient.invalidateQueries({ queryKey: ["couriers"] })
    },
    onError: handleError.bind(showErrorToast),
  })
  const editCourier = (courier: CourierPublic) => {
    setEditingId(courier.id)
    setForm({
      code: courier.code,
      name: courier.name,
      service_type: courier.service_type || "",
      base_cost: courier.base_cost,
    })
  }
  const submit = () => {
    if (editingId) {
      updateMutation.mutate(form)
      return
    }
    createMutation.mutate(form)
  }

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Couriers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
          <Input
            value={form.code}
            placeholder="JNE"
            onChange={(event) => setForm({ ...form, code: event.target.value })}
          />
          <Input
            value={form.name}
            placeholder="JNE Regular"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            value={form.service_type || ""}
            placeholder="REG"
            onChange={(event) =>
              setForm({ ...form, service_type: event.target.value })
            }
          />
          <Input
            value={form.base_cost}
            type="number"
            onChange={(event) =>
              setForm({ ...form, base_cost: event.target.value })
            }
          />
          <div className="flex gap-2 md:col-span-4">
            <Button
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={submit}
            >
              <Save />
              {editingId ? "Update Courier" : "Add Courier"}
            </Button>
            {editingId ? (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyCourier)
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Base Cost</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((courier) => (
              <TableRow key={courier.id}>
                <TableCell>{courier.code}</TableCell>
                <TableCell>{courier.name}</TableCell>
                <TableCell>{courier.service_type || "-"}</TableCell>
                <TableCell>{formatCurrency(courier.base_cost)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => editCourier(courier)}
                    >
                      <Edit3 />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(courier.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ProductManager() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: MarketplaceService.readCategories,
  })
  const { data } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => MarketplaceService.readAdminProducts({ limit: 100 }),
  })
  const [editing, setEditing] = useState<ProductPublic | null>(null)
  const updateMutation = useMutation({
    mutationFn: (product: ProductPublic) => {
      const requestBody: ProductUpdate = {
        category_id: product.category_id || null,
        name: product.name,
        slug: product.slug,
        description: product.description || null,
        price: product.price,
        stock_quantity: product.stock_quantity,
        weight_grams: product.weight_grams || null,
        image_url: product.image_url || null,
        is_active: product.is_active,
      }
      return MarketplaceService.updateProduct({
        productId: product.id,
        requestBody,
      })
    },
    onSuccess: () => {
      showSuccessToast("Produk diperbarui")
      setEditing(null)
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: handleError.bind(showErrorToast),
  })
  const deleteMutation = useMutation({
    mutationFn: MarketplaceService.deleteProduct,
    onSuccess: () => {
      showSuccessToast("Produk dinonaktifkan")
      queryClient.invalidateQueries({ queryKey: ["admin-products"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  useEffect(() => {
    if (editing) {
      setEditing({ ...editing, slug: slugify(editing.name) })
    }
  }, [editing?.name])

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Name</Label>
              <Input
                value={editing.name}
                onChange={(event) =>
                  setEditing({ ...editing, name: event.target.value })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Slug</Label>
              <Input value={editing.slug} readOnly />
            </div>
            <Input
              value={editing.price}
              type="number"
              onChange={(event) =>
                setEditing({ ...editing, price: event.target.value })
              }
            />
            <Input
              value={editing.stock_quantity}
              type="number"
              onChange={(event) =>
                setEditing({
                  ...editing,
                  stock_quantity: Number(event.target.value),
                })
              }
            />
            <Select
              value={editing.category_id ? String(editing.category_id) : "none"}
              onValueChange={(value) =>
                setEditing({
                  ...editing,
                  category_id: value === "none" ? null : Number(value),
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories?.data.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={editing.is_active ? "active" : "inactive"}
              onValueChange={(value) =>
                setEditing({ ...editing, is_active: value === "active" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 md:col-span-4">
              <Button
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate(editing)}
              >
                <Save />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>{product.is_active ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setEditing(product)}
                    >
                      <Edit3 />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(product.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function OrderRow({ order }: { order: OrderPublic }) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [status, setStatus] = useState(order.status)
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status)
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "")
  const mutation = useMutation({
    mutationFn: () =>
      MarketplaceService.updateAdminOrder({
        orderId: order.id,
        requestBody: {
          status,
          payment_status: paymentStatus,
          tracking_number: trackingNumber || null,
        },
      }),
    onSuccess: () => {
      showSuccessToast("Order diperbarui")
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
    },
    onError: handleError.bind(showErrorToast),
  })

  return (
    <TableRow>
      <TableCell>#{order.id.slice(0, 8)}</TableCell>
      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
      <TableCell>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Select value={paymentStatus} onValueChange={setPaymentStatus}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Input
          value={trackingNumber}
          placeholder="Resi"
          onChange={(event) => setTrackingNumber(event.target.value)}
        />
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <Save />
          Save
        </Button>
      </TableCell>
    </TableRow>
  )
}

function OrderManager() {
  const { data } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => MarketplaceService.readAdminOrders({ limit: 100 }),
  })

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function AdminMarketplace() {
  return (
    <div className="space-y-6">
      <CategoryManager />
      <CourierManager />
      <ProductManager />
      <OrderManager />
    </div>
  )
}
