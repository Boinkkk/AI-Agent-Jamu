import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import {
  ArrowLeft,
  BadgeCheck,
  Factory,
  HeartPulse,
  Leaf,
  MapPin,
  PackageCheck,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { MarketplaceService } from "@/client/marketplace"
import { formatCurrency } from "@/components/Marketplace/format"
import { ProductCard } from "@/components/Marketplace/ProductCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import useCustomToast from "@/hooks/useCustomToast"

export const Route = createFileRoute("/_layout/products/$productId")({
  component: ProductDetailPage,
  head: () => ({
    meta: [{ title: "Detail Produk - Toko Jamu Madura" }],
  }),
})

const parseStockTone = (stock: number): { label: string; className: string } => {
  if (stock <= 0) {
    return { label: "Stok habis", className: "bg-destructive text-white" }
  }
  if (stock <= 5) {
    return { label: "Stok terbatas", className: "bg-[#f3ead6] text-[#775631]" }
  }
  return { label: "Siap dikirim", className: "bg-[#eef3dc] text-[#48633f]" }
}

function ProductDetailPage() {
  const { productId } = Route.useParams()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [quantity, setQuantity] = useState(1)
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => MarketplaceService.readProduct(productId),
  })
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: MarketplaceService.readCategories,
  })
  const product = productQuery.data
  const relatedProductsQuery = useQuery({
    queryKey: ["products", "related", product?.category_id, productId],
    enabled: Boolean(product?.category_id),
    queryFn: () =>
      MarketplaceService.readProducts({
        categoryId: product?.category_id || undefined,
        limit: 4,
      }),
  })
  const addToCartMutation = useMutation({
    mutationFn: (payload: { productId: string; quantity: number }) =>
      MarketplaceService.addCartItem({
        productId: payload.productId,
        quantity: payload.quantity,
      }),
    onSuccess: () => {
      showSuccessToast("Produk ditambahkan ke keranjang")
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: () => showErrorToast("Gagal menambahkan produk"),
  })
  const categoryName = useMemo(() => {
    return (
      categoriesQuery.data?.data.find(
        (category) => category.id === product?.category_id,
      )?.name || "Jamu Madura"
    )
  }, [categoriesQuery.data?.data, product?.category_id])

  if (productQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-[560px] rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <Card className="rounded-lg">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
          <PackageCheck className="size-10 text-muted-foreground" />
          <div>
            <p className="font-medium">Produk tidak ditemukan</p>
            <p className="text-sm text-muted-foreground">
              Produk mungkin sudah tidak tersedia di katalog.
            </p>
          </div>
          <Button asChild>
            <RouterLink to="/products">Kembali ke katalog</RouterLink>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const stockTone = parseStockTone(product.stock_quantity)
  const relatedProducts =
    relatedProductsQuery.data?.data.filter((item) => item.id !== product.id) || []
  const productHighlights = [
    {
      icon: HeartPulse,
      label: "Khasiat",
      value: product.benefit,
      fallback: "Informasi khasiat akan dilengkapi oleh admin toko.",
    },
    {
      icon: Leaf,
      label: "Komposisi",
      value: product.composition,
      fallback: "Komposisi belum tersedia.",
    },
    {
      icon: Sparkles,
      label: "Aturan pakai",
      value: product.directions,
      fallback: "Ikuti petunjuk pada kemasan produk.",
    },
    {
      icon: ShieldCheck,
      label: "Penyimpanan",
      value: product.storage_instructions,
      fallback: "Simpan di tempat kering dan terlindung dari sinar matahari.",
    },
  ]
  const metadata: Array<{
    label: string
    value?: string | number | null
    icon: LucideIcon
  }> = [
    { label: "Produsen", value: product.manufacturer, icon: Factory },
    { label: "Lokasi pemasaran", value: product.marketing_location, icon: MapPin },
    { label: "Lokasi produksi", value: product.production_location, icon: MapPin },
    { label: "Kabupaten", value: product.regency, icon: MapPin },
    { label: "Jenis izin", value: product.licensing, icon: BadgeCheck },
    { label: "Nomor izin", value: product.licensing_number, icon: ShieldCheck },
    {
      label: "Berat",
      value: product.weight_grams ? `${product.weight_grams} gram` : null,
      icon: Scale,
    },
  ]

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" className="px-0">
        <RouterLink to="/products">
          <ArrowLeft />
          Kembali ke katalog
        </RouterLink>
      </Button>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_420px]">
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="relative bg-[linear-gradient(135deg,#eef3dc,#d8c09b)]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="aspect-[5/4] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[5/4] items-center justify-center text-[#526947]">
                <Leaf className="size-24" />
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <Badge className="rounded-md bg-white/90 text-[#48633f]">
                {categoryName}
              </Badge>
              <Badge className={`rounded-md ${stockTone.className}`}>
                {stockTone.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-5 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#775631]">
                  <Star className="size-4 fill-current" />
                  <span>{product.average_rating} rating katalog</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {product.name}
                </h1>
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  {product.description ||
                    "Produk jamu tradisional Madura pilihan dengan informasi lengkap untuk membantu Anda memilih produk yang tepat."}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Harga</p>
                <p className="mt-1 text-lg font-semibold text-[#48633f]">
                  {formatCurrency(product.price)}
                </p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Stok</p>
                <p className="mt-1 text-lg font-semibold">
                  {product.stock_quantity} produk
                </p>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs text-muted-foreground">Berat</p>
                <p className="mt-1 text-lg font-semibold">
                  {product.weight_grams ? `${product.weight_grams} g` : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-lg border bg-card p-5 shadow-sm lg:sticky lg:top-24">
          <div className="space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">Total estimasi</p>
              <p className="text-3xl font-bold text-[#48633f]">
                {formatCurrency(Number(product.price) * quantity)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {quantity} x {formatCurrency(product.price)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="quantity">
                Jumlah
              </label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={Math.max(1, product.stock_quantity)}
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Math.min(
                      Math.max(1, Number(event.target.value)),
                      Math.max(1, product.stock_quantity),
                    ),
                  )
                }
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={addToCartMutation.isPending || product.stock_quantity <= 0}
              onClick={() =>
                addToCartMutation.mutate({
                  productId,
                  quantity: Math.max(1, quantity),
                })
              }
            >
              <ShoppingCart />
              Tambah ke keranjang
            </Button>

            <div className="rounded-lg bg-[#f7f0df] p-4 text-sm text-[#6c5845]">
              Produk akan masuk ke keranjang Anda. Ongkir dihitung saat checkout
              berdasarkan kurir dan alamat pengiriman.
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {productHighlights.map((item) => (
          <Card key={item.label} className="rounded-lg">
            <CardHeader className="flex-row items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-[#eef3dc] text-[#48633f]">
                <item.icon />
              </div>
              <CardTitle className="text-lg">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted-foreground">
                {item.value || item.fallback}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Detail produksi dan legalitas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {metadata.map((item) => (
            <div key={item.label} className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <item.icon className="size-4 text-[#48633f]" />
                {item.label}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.value || "-"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {relatedProducts.length ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Produk sejenis
            </h2>
            <p className="text-muted-foreground">
              Rekomendasi lain dari kategori {categoryName}.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.slice(0, 3).map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={(targetProductId) =>
                  addToCartMutation.mutate({
                    productId: targetProductId,
                    quantity: 1,
                  })
                }
                isAdding={addToCartMutation.isPending}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
