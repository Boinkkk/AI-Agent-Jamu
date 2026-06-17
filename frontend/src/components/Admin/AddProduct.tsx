import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PackagePlus } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  MarketplaceService,
  type ProductCreate,
} from "@/client/marketplace"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const optionalText = z.string().optional()

const formSchema = z.object({
  category_id: z.string().optional(),
  name: z.string().min(1, { message: "Nama produk wajib diisi" }).max(100),
  slug: z.string().min(1, { message: "Slug wajib diisi" }).max(100),
  description: optionalText,
  price: z.string().refine((value) => Number(value) > 0, {
    message: "Harga harus lebih dari 0",
  }),
  stock_quantity: z.string().refine((value) => Number(value) >= 0, {
    message: "Stok tidak boleh negatif",
  }),
  weight_grams: z.string().optional(),
  image_url: optionalText,
  benefit: optionalText,
  composition: optionalText,
  directions: optionalText,
  storage_instructions: optionalText,
  manufacturer: optionalText,
  marketing_location: optionalText,
  production_location: optionalText,
  regency: optionalText,
  licensing: optionalText,
  licensing_number: optionalText,
})

type FormData = z.infer<typeof formSchema>

const defaultValues: FormData = {
  category_id: "none",
  name: "",
  slug: "",
  description: "",
  price: "",
  stock_quantity: "0",
  weight_grams: "",
  image_url: "",
  benefit: "",
  composition: "",
  directions: "",
  storage_instructions: "",
  manufacturer: "",
  marketing_location: "",
  production_location: "",
  regency: "",
  licensing: "",
  licensing_number: "",
}

const cleanText = (value?: string): string | null => {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : null
}

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const toProductCreate = (data: FormData): ProductCreate => ({
  category_id:
    data.category_id && data.category_id !== "none"
      ? Number(data.category_id)
      : null,
  name: data.name.trim(),
  slug: data.slug.trim(),
  description: cleanText(data.description),
  price: data.price,
  stock_quantity: Number(data.stock_quantity),
  weight_grams: data.weight_grams ? Number(data.weight_grams) : null,
  image_url: cleanText(data.image_url),
  is_active: true,
  average_rating: "0.00",
  benefit: cleanText(data.benefit),
  composition: cleanText(data.composition),
  directions: cleanText(data.directions),
  storage_instructions: cleanText(data.storage_instructions),
  manufacturer: cleanText(data.manufacturer),
  marketing_location: cleanText(data.marketing_location),
  production_location: cleanText(data.production_location),
  regency: cleanText(data.regency),
  licensing: cleanText(data.licensing),
  licensing_number: cleanText(data.licensing_number),
})

const AddProduct = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: MarketplaceService.readCategories,
  })
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues,
  })
  const productName = form.watch("name")
  useEffect(() => {
    form.setValue("slug", slugify(productName), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [form, productName])
  const mutation = useMutation({
    mutationFn: (data: ProductCreate) => MarketplaceService.createProduct(data),
    onSuccess: () => {
      showSuccessToast("Produk berhasil ditambahkan")
      form.reset(defaultValues)
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
  const onSubmit = (data: FormData) => {
    mutation.mutate(toProductCreate(data))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PackagePlus />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>
            Tambahkan produk Jamu Madura ke katalog marketplace.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama produk</FormLabel>
                    <FormControl>
                      <Input placeholder="Kunyit Asam Madura" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="kunyit-asam-madura"
                        readOnly
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={categoriesQuery.isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tanpa kategori</SelectItem>
                        {categoriesQuery.data?.data.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={500} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stok</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight_grams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Berat gram</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["description", "Deskripsi"],
                ["benefit", "Khasiat"],
                ["composition", "Komposisi"],
                ["directions", "Aturan pakai"],
                ["storage_instructions", "Penyimpanan"],
              ].map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof FormData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <textarea
                          className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          {...field}
                          value={String(field.value || "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["manufacturer", "Produsen"],
                ["marketing_location", "Lokasi pemasaran"],
                ["production_location", "Lokasi produksi"],
                ["regency", "Kabupaten"],
                ["licensing", "Jenis izin"],
                ["licensing_number", "Nomor izin"],
              ].map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof FormData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} value={String(field.value || "")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save Product
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddProduct
