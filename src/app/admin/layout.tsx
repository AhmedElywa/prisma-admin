import { AdminLayout } from '@/components/AdminLayout'
import { getAllModels } from '@/lib/admin/settings'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const models = await getAllModels()
  
  return <AdminLayout models={models}>{children}</AdminLayout>
}