import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"

import type { AddressCreate } from "@/client/marketplace"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import useCustomToast from "@/hooks/useCustomToast"

export const Route = createFileRoute("/_layout/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [{ title: "Checkout - Toko Jamu Madura" }],
  }),
})

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

function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const [selectedCourierId, setSelectedCourierId] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("doku_va")
  const [addressForm, setAddressForm] = useState<AddressCreate>(emptyAddress)

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: MarketplaceService.readCart,
  })
  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: MarketplaceService.readAddresses,
  })
  const couriersQuery = useQuery({
    queryKey: ["couriers"],
    queryFn: MarketplaceService.readCouriers,
  })
  const createAddressMutation = useMutation({
    mutationFn: MarketplaceService.createAddress,
    onSuccess: (address) => {
      setSelectedAddressId(address.id)
      setAddressForm(emptyAddress)
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
      showSuccessToast("Alamat disimpan")
    },
    onError: () => showErrorToast("Gagal menyimpan alamat"),
  })
  const checkoutMutation = useMutation({
    mutationFn: () =>
      MarketplaceService.checkout({
        addressId: selectedAddressId,
        courierId: Number(selectedCourierId),
        paymentMethod: selectedPaymentMethod,
      }),
    onSuccess: () => {
      showSuccessToast("Pesanan berhasil dibuat")
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      navigate({ to: "/settings" })
    },
    onError: () => showErrorToast("Checkout gagal"),
  })

  const selectedCourier = useMemo(
    () =>
      couriersQuery.data?.data.find(
        (courier) => String(courier.id) === selectedCourierId,
      ),
    [couriersQuery.data?.data, selectedCourierId],
  )
  useEffect(() => {
    const selectedAddress = addressesQuery.data?.data.find(
      (address) => address.id === selectedAddressId,
    )
    if (!selectedAddress) {
      return
    }
    setAddressForm({
      label: selectedAddress.label || "",
      recipient_name: selectedAddress.recipient_name,
      phone_number: selectedAddress.phone_number,
      address_line: selectedAddress.address_line,
      city: selectedAddress.city,
      province: selectedAddress.province,
      postal_code: selectedAddress.postal_code,
      is_main: selectedAddress.is_main,
    })
  }, [addressesQuery.data?.data, selectedAddressId])
  const subtotal = Number(cartQuery.data?.subtotal || 0)
  const shippingCost = Number(selectedCourier?.base_cost || 0)
  const total = subtotal + shippingCost
  const isLoading =
    cartQuery.isLoading || addressesQuery.isLoading || couriersQuery.isLoading

  if (isLoading) {
    return <Skeleton className="h-[520px] rounded-lg" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          Pilih alamat dan kurir untuk menyelesaikan pesanan.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Alamat pengiriman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedAddressId}
                onValueChange={setSelectedAddressId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih alamat tersimpan" />
                </SelectTrigger>
                <SelectContent>
                  {addressesQuery.data?.data.map((address) => (
                    <SelectItem key={address.id} value={address.id}>
                      {address.label || address.recipient_name} - {address.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={addressForm.label || ""}
                    onChange={(event) =>
                      setAddressForm({ ...addressForm, label: event.target.value })
                    }
                    placeholder="Rumah"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama penerima</Label>
                  <Input
                    value={addressForm.recipient_name}
                    onChange={(event) =>
                      setAddressForm({
                        ...addressForm,
                        recipient_name: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomor telepon</Label>
                  <Input
                    value={addressForm.phone_number}
                    onChange={(event) =>
                      setAddressForm({
                        ...addressForm,
                        phone_number: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kode pos</Label>
                  <Input
                    value={addressForm.postal_code}
                    onChange={(event) =>
                      setAddressForm({
                        ...addressForm,
                        postal_code: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kota</Label>
                  <Input
                    value={addressForm.city}
                    onChange={(event) =>
                      setAddressForm({ ...addressForm, city: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provinsi</Label>
                  <Input
                    value={addressForm.province}
                    onChange={(event) =>
                      setAddressForm({
                        ...addressForm,
                        province: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Alamat lengkap</Label>
                  <Input
                    value={addressForm.address_line}
                    onChange={(event) =>
                      setAddressForm({
                        ...addressForm,
                        address_line: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={createAddressMutation.isPending}
                onClick={() => createAddressMutation.mutate(addressForm)}
              >
                Simpan alamat baru
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Kurir</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedCourierId}
                onValueChange={setSelectedCourierId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kurir" />
                </SelectTrigger>
                <SelectContent>
                  {couriersQuery.data?.data.map((courier) => (
                    <SelectItem key={courier.id} value={String(courier.id)}>
                      {courier.name} - {formatCurrency(courier.base_cost)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Metode pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doku_va">DOKU Virtual Account</SelectItem>
                  <SelectItem value="doku_qris">DOKU QRIS</SelectItem>
                  <SelectItem value="doku_retail">DOKU Retail Payment</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-lg">
          <CardHeader>
            <CardTitle>Ringkasan pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartQuery.data?.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>{formatCurrency(item.line_total)}</span>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>Ongkir</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              <div className="mt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              disabled={
                !cartQuery.data?.items.length ||
                !selectedAddressId ||
                !selectedCourierId ||
                !selectedPaymentMethod ||
                checkoutMutation.isPending
              }
              onClick={() => checkoutMutation.mutate()}
            >
              Buat pesanan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
