import { Link as RouterLink } from "@tanstack/react-router"
import { Leaf, ShoppingCart, Star } from "lucide-react"

import type { ProductPublic } from "@/client/marketplace"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "./format"

type ProductCardProps = {
  product: ProductPublic
  onAddToCart: (productId: string) => void
  isAdding?: boolean
}

export function ProductCard({
  product,
  onAddToCart,
  isAdding = false,
}: ProductCardProps) {
  return (
    <Card className="overflow-hidden rounded-lg py-0">
      <div className="aspect-[4/3] bg-[linear-gradient(135deg,#eef3dc,#d9c7aa)]">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#526947]">
            <Leaf className="size-12" />
          </div>
        )}
      </div>
      <CardHeader className="gap-2 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-snug">
            <RouterLink
              to="/products/$productId"
              params={{ productId: product.id }}
              className="hover:text-primary"
            >
              {product.name}
            </RouterLink>
          </CardTitle>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#f3ead6] px-2 py-1 text-xs text-[#775631]">
            <Star className="size-3 fill-current" />
            {product.average_rating}
          </span>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {product.description || product.benefit || "Ramuan tradisional pilihan."}
        </p>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Harga</p>
            <p className="font-semibold text-[#48633f]">
              {formatCurrency(product.price)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Stok {product.stock_quantity}
          </p>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-[1fr_1.2fr] gap-2 px-4 pb-4">
        <Button asChild type="button" variant="outline">
          <RouterLink to="/products/$productId" params={{ productId: product.id }}>
            Detail
          </RouterLink>
        </Button>
        <Button
          type="button"
          className="w-full"
          onClick={() => onAddToCart(product.id)}
          disabled={isAdding || product.stock_quantity <= 0}
        >
          <ShoppingCart />
          Tambah
        </Button>
      </CardFooter>
    </Card>
  )
}
