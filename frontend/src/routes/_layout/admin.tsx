import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { Suspense } from "react"

import { type UserPublic, UsersService } from "@/client"
import AddCategory from "@/components/Admin/AddCategory"
import AddProduct from "@/components/Admin/AddProduct"
import AddUser from "@/components/Admin/AddUser"
import AdminMarketplace from "@/components/Admin/AdminMarketplace"
import { columns, type UserTableData } from "@/components/Admin/columns"
import { DataTable } from "@/components/Common/DataTable"
import PendingUsers from "@/components/Pending/PendingUsers"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"

function getUsersQueryOptions() {
  return {
    queryFn: () => UsersService.readUsers({ skip: 0, limit: 100 }),
    queryKey: ["users"],
  }
}

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
  beforeLoad: async () => {
    const user = await UsersService.readUserMe()
    if (!user.is_superuser) {
      throw redirect({
        to: "/",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Admin - FastAPI Template",
      },
    ],
  }),
})

function UsersTableContent() {
  const { user: currentUser } = useAuth()
  const { data: users } = useSuspenseQuery(getUsersQueryOptions())

  const tableData: UserTableData[] = users.data.map((user: UserPublic) => ({
    ...user,
    isCurrentUser: currentUser?.id === user.id,
  }))

  return <DataTable columns={columns} data={tableData} />
}

function UsersTable() {
  return (
    <Suspense fallback={<PendingUsers />}>
      <UsersTableContent />
    </Suspense>
  )
}

function Admin() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-lg">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Products</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tambahkan produk Jamu Madura ke katalog marketplace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddCategory />
            <AddProduct />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fitur ini hanya tersedia untuk admin. User biasa akan diarahkan ke
            dashboard sebelum halaman admin terbuka.
          </p>
        </CardContent>
      </Card>
      <AdminMarketplace />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <AddUser />
      </div>
      <UsersTable />
    </div>
  )
}
