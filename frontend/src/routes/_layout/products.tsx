import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"

import { MarketplaceService } from "@/client/marketplace"
import { ProductCard } from "@/components/Marketplace/ProductCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import useCustomToast from "@/hooks/useCustomToast"

export const Route = createFileRoute("/_layout/products")({
  component: ProductsRoute,
  head: () => ({
    meta: [{ title: "Katalog Produk - Toko Jamu Madura" }],
  }),
})

const pageSize = 9

function ProductsRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname !== "/products") {
    return <Outlet />
  }

  return <ProductsPage />
}

function ProductsPage() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [categoryValue, setCategoryValue] = useState("all")
  const categoryId = categoryValue === "all" ? undefined : Number(categoryValue)

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: MarketplaceService.readCategories,
  })
  const productsQuery = useQuery({
    queryKey: ["products", page, categoryId, search],
    queryFn: () =>
      MarketplaceService.readProducts({
        skip: page * pageSize,
        limit: pageSize,
        categoryId,
        search: search || undefined,
      }),
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
  const totalPages = useMemo(() => {
    const count = productsQuery.data?.count || 0
    return Math.max(1, Math.ceil(count / pageSize))
  }, [productsQuery.data?.count])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Katalog Jamu Madura</h1>
        <p className="text-muted-foreground">
          Cari produk berdasarkan nama, kategori, dan kebutuhan harian Anda.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-[1fr_240px]">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(0)
            }}
            placeholder="Cari beras kencur, kunyit asam, atau produk lain"
            className="pl-9"
          />
        </div>
        <Select
          value={categoryValue}
          onValueChange={(value) => {
            setCategoryValue(value)
            setPage(0)
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua kategori</SelectItem>
            {categoriesQuery.data?.data.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {productsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: pageSize }).map((_, index) => (
            <Skeleton key={index} className="h-96 rounded-lg" />
          ))}
        </div>
      ) : productsQuery.data?.data.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productsQuery.data.data.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(productId) => addToCartMutation.mutate(productId)}
              isAdding={addToCartMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-10 text-center">
          <p className="font-medium">Produk belum ditemukan</p>
          <p className="text-sm text-muted-foreground">
            Coba kata kunci lain atau pilih semua kategori.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Halaman {page + 1} dari {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  )
}
