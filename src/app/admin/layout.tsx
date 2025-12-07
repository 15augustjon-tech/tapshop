import { redirect } from 'next/navigation'
import { getAuthenticatedAdmin } from '@/lib/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await getAuthenticatedAdmin()

  if (!auth.success) {
    // Redirect to seller login if not authenticated as admin
    redirect('/seller/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">TapShop Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{auth.seller?.shop_name}</span>
            <a
              href="/api/auth/seller/logout"
              className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-gray-700"
            >
              Logout
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
