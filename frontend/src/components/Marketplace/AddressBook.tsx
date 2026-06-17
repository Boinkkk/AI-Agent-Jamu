import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Edit3, MapPin, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import type { AddressCreate, AddressPublic } from "@/client/marketplace"
import { MarketplaceService } from "@/client/marketplace"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import useCustomToast from "@/hooks/useCustomToast"

const emptyAddress: AddressCreate = {
  label: "",
  recipient_name: "",
  phone_number: "",
  address_line: "",
  city: "",
  province: "",
  postal_code: "",
  is_main: false,
}

type AddressFormProps = {
  initialValue?: AddressPublic
  onCancel?: () => void
}

function AddressForm({ initialValue, onCancel }: AddressFormProps) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [form, setForm] = useState<AddressCreate>({
    label: initialValue?.label || "",
    recipient_name: initialValue?.recipient_name || "",
    phone_number: initialValue?.phone_number || "",
    address_line: initialValue?.address_line || "",
    city: initialValue?.city || "",
    province: initialValue?.province || "",
    postal_code: initialValue?.postal_code || "",
    is_main: initialValue?.is_main || false,
  })
  const createMutation = useMutation({
    mutationFn: MarketplaceService.createAddress,
    onSuccess: () => {
      showSuccessToast("Alamat berhasil ditambahkan")
      setForm(emptyAddress)
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
    onError: () => showErrorToast("Gagal menyimpan alamat"),
  })
  const updateMutation = useMutation({
    mutationFn: (requestBody: AddressCreate) =>
      MarketplaceService.updateAddress({
        addressId: initialValue?.id || "",
        requestBody,
      }),
    onSuccess: () => {
      showSuccessToast("Alamat berhasil diperbarui")
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      onCancel?.()
    },
    onError: () => showErrorToast("Gagal memperbarui alamat"),
  })
  const isPending = createMutation.isPending || updateMutation.isPending
  const submit = () => {
    if (initialValue) {
      updateMutation.mutate(form)
      return
    }
    createMutation.mutate(form)
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2">
      {[
        ["label", "Label", "Rumah"],
        ["recipient_name", "Penerima", "Nama penerima"],
        ["phone_number", "Telepon", "0812..."],
        ["postal_code", "Kode pos", "69100"],
        ["city", "Kota", "Pamekasan"],
        ["province", "Provinsi", "Jawa Timur"],
      ].map(([key, label, placeholder]) => (
        <div key={key} className="space-y-2">
          <Label>{label}</Label>
          <Input
            value={String(form[key as keyof AddressCreate] || "")}
            placeholder={placeholder}
            onChange={(event) =>
              setForm({ ...form, [key]: event.target.value })
            }
          />
        </div>
      ))}
      <div className="space-y-2 md:col-span-2">
        <Label>Alamat lengkap</Label>
        <Input
          value={form.address_line}
          placeholder="Jalan, nomor rumah, kecamatan"
          onChange={(event) =>
            setForm({ ...form, address_line: event.target.value })
          }
        />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <Button type="button" onClick={submit} disabled={isPending}>
          <Plus />
          {initialValue ? "Update alamat" : "Tambah alamat"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function AddressBook() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [editingAddress, setEditingAddress] = useState<AddressPublic | null>(null)
  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: MarketplaceService.readAddresses,
  })
  const deleteMutation = useMutation({
    mutationFn: MarketplaceService.deleteAddress,
    onSuccess: () => {
      showSuccessToast("Alamat dihapus")
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
    onError: () => showErrorToast("Gagal menghapus alamat"),
  })

  if (addressesQuery.isLoading) {
    return <Skeleton className="h-64 rounded-lg" />
  }

  return (
    <div className="space-y-5">
      <AddressForm />
      <div className="grid gap-3 md:grid-cols-2">
        {addressesQuery.data?.data.map((address) => (
          <Card key={address.id} className="rounded-lg">
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 text-[#48633f]" />
                <div>
                  <CardTitle className="text-base">
                    {address.label || address.recipient_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {address.recipient_name} - {address.phone_number}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setEditingAddress(address)}
                >
                  <Edit3 />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(address.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {address.address_line}, {address.city}, {address.province}{" "}
                {address.postal_code}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      {editingAddress ? (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Edit alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm
              initialValue={editingAddress}
              onCancel={() => setEditingAddress(null)}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
