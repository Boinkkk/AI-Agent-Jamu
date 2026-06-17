import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreditCard, PackageCheck } from "lucide-react"

import { MarketplaceService } from "@/client/marketplace"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "./format"

export function OrderHistory() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => MarketplaceService.readOrders({ limit: 50 }),
  })
  const payMutation = useMutation({
    mutationFn: MarketplaceService.payOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!data?.data.length) {
    return (
      <Card className="rounded-lg">
        <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
          <PackageCheck className="size-9 text-muted-foreground" />
          <div>
            <p className="font-medium">Belum ada pesanan</p>
            <p className="text-sm text-muted-foreground">
              Pesanan Jamu Madura Anda akan tampil di sini.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {data.data.map((order) => (
        <Card key={order.id} className="rounded-lg">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Pesanan #{order.id.slice(0, 8)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.created_at)} - {order.payment_method}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-md bg-[#eef3dc] px-2.5 py-1 text-xs font-medium text-[#48633f]">
                {order.payment_status}
              </span>
              {order.payment_status !== "paid" ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={payMutation.isPending}
                  onClick={() => payMutation.mutate(order.id)}
                >
                  <CreditCard />
                  Bayar
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span>
                    {item.product_name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(Number(item.price_at_purchase) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-3 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
