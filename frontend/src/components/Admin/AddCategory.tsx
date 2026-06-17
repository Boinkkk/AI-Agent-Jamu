import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FolderPlus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  MarketplaceService,
  type CategoryCreate,
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  name: z.string().min(1, { message: "Nama kategori wajib diisi" }).max(50),
  slug: z.string().min(1, { message: "Slug wajib diisi" }).max(50),
  description: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const defaultValues: FormData = {
  name: "",
  slug: "",
  description: "",
}

const AddCategory = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues,
  })
  const mutation = useMutation({
    mutationFn: (data: CategoryCreate) => MarketplaceService.createCategory(data),
    onSuccess: () => {
      showSuccessToast("Kategori berhasil ditambahkan")
      form.reset(defaultValues)
      setIsOpen(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
  const onSubmit = (data: FormData) => {
    mutation.mutate({
      name: data.name.trim(),
      slug: data.slug.trim(),
      description: data.description?.trim() || null,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlus />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Tambahkan kategori produk agar katalog lebih mudah difilter.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama kategori</FormLabel>
                  <FormControl>
                    <Input placeholder="Jamu Kesehatan Wanita" {...field} />
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
                    <Input placeholder="jamu-kesehatan-wanita" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input placeholder="Deskripsi singkat kategori" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton type="submit" loading={mutation.isPending}>
                Save Category
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddCategory
