import { useQuery } from "@tanstack/react-query"
import { Link as RouterLink, createFileRoute } from "@tanstack/react-router"
import { ArrowRight, Leaf, ShoppingBag, Sparkles } from "lucide-react"

import { MarketplaceService } from "@/client/marketplace"
import { ProductCard } from "@/components/Marketplace/ProductCard"
import { Button } from "@/components/ui/button"
import useCustomToast from "@/hooks/useCustomToast"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Toko Jamu Madura",
      },
    ],
  }),
})

function Dashboard() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const productsQuery = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => MarketplaceService.readProducts({ limit: 4 }),
  })
  const addToCartMutation = useMutation({
    mutationFn: (productId: string) =>
      MarketplaceService.addCartItem({ productId, quantity: 1 }),
    onSuccess: () => {
      showSuccessToast("Produk ditambahkan ke keranjang")
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
    onError: () => showErrorToast("Gagal menambahkan produk"),
  })

  return (
    <div className="space-y-10">
      <section className="grid gap-6 overflow-hidden rounded-lg border bg-[#f7f0df] md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-h-[360px] flex-col justify-center gap-6 p-8 md:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-md bg-white/70 px-3 py-1 text-sm text-[#48633f]">
            <Leaf className="size-4" />
            Racikan tradisional Madura
          </div>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-[#2f3f2a] md:text-5xl">
              Jamu Madura pilihan untuk ritme hidup modern
            </h1>
            <p className="text-base leading-7 text-[#6c5845]">
              Temukan produk herbal berbahan rempah, akar, dan tanaman pilihan
              dengan informasi komposisi, khasiat, aturan pakai, dan asal
              produksi yang jelas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <RouterLink to="/products">
                Belanja sekarang
                <ArrowRight />
              </RouterLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <RouterLink to="/cart">
                <ShoppingBag />
                Keranjang
              </RouterLink>
            </Button>
          </div>
        </div>
        <div className="relative min-h-[280px] bg-[radial-gradient(circle_at_70%_30%,#d7b56d,transparent_28%),linear-gradient(135deg,#778b5f,#b99a6a)]">
          <div className="absolute inset-8 rounded-lg border border-white/40 bg-white/20 backdrop-blur-[1px]" />
          <div className="absolute right-8 bottom-8 left-8 rounded-lg bg-[#fff8ea]/90 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-md bg-[#eef3dc] text-[#48633f]">
                <Sparkles />
              </div>
              <div>
                <p className="font-semibold text-[#2f3f2a]">Kurasi herbal</p>
                <p className="text-sm text-[#6c5845]">
                  Detail komposisi dan aturan pakai tersedia di halaman produk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Produk pilihan
            </h2>
            <p className="text-muted-foreground">
              Jelajahi jamu siap kirim dari katalog toko.
            </p>
          </div>
          <Button asChild variant="outline">
            <RouterLink to="/products">Lihat semua</RouterLink>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productsQuery.data?.data.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(productId) => addToCartMutation.mutate(productId)}
              isAdding={addToCartMutation.isPending}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
