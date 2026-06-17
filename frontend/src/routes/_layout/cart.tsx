import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import { Minus, Plus, Trash2 } from "lucide-react"

import { MarketplaceService } from "@/client/marketplace"
import { formatCurrency } from "@/components/Marketplace/format"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import useCustomToast from "@/hooks/useCustomToast"

export const Route = createFileRoute("/_layout/cart")({
  component: CartPage,
  head: () => ({
    meta: [{ title: "Keranjang - Toko Jamu Madura" }],
  }),
})

function CartPage() {
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: MarketplaceService.readCart,
  })
  const updateMutation = useMutation({
    mutationFn: (data: { itemId: string; quantity: number }) =>
      MarketplaceService.updateCartItem(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => showErrorToast("Gagal memperbarui keranjang"),
  })
  const deleteMutation = useMutation({
    mutationFn: MarketplaceService.deleteCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => showErrorToast("Gagal menghapus item"),
  })

  if (cartQuery.isLoading) {
    return <Skeleton className="h-96 rounded-lg" />
  }

  const cart = cartQuery.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keranjang Belanja</h1>
        <p className="text-muted-foreground">
          Periksa produk sebelum lanjut ke checkout.
        </p>
      </div>

      {!cart?.items.length ? (
        <Card className="rounded-lg">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
            <div>
              <p className="font-medium">Keranjang masih kosong</p>
              <p className="text-sm text-muted-foreground">
                Tambahkan produk Jamu Madura dari katalog.
              </p>
            </div>
            <Button asChild>
              <RouterLink to="/products">Belanja produk</RouterLink>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {cart.items.map((item) => (
              <Card key={item.id} className="rounded-lg">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#eef3dc]">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-[#48633f]">Jamu</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={item.quantity <= 1 || updateMutation.isPending}
                      onClick={() =>
                        updateMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity - 1,
                        })
                      }
                    >
                      <Minus />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={updateMutation.isPending}
                      onClick={() =>
                        updateMutation.mutate({
                          itemId: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                    >
                      <Plus />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:w-36">
                    <p className="font-semibold">
                      {formatCurrency(item.line_total)}
                    </p>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit rounded-lg">
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total item</span>
                <span>{cart.count}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <RouterLink to="/checkout">Checkout</RouterLink>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
