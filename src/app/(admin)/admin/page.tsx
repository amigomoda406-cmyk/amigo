import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import Link from 'next/link';
import { client } from '@/lib/sanity/client';
import { Package, ShoppingBag, Tag, Settings, LogOut, BarChart3, Clock } from 'lucide-react';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET);
    await jwtVerify(token, secret);
  } catch {
    redirect('/admin/login');
  }
}

async function getDashboardStats() {
  try {
    const query = `{
      "totalProducts": count(*[_type == "product"]),
      "inStockProducts": count(*[_type == "product" && inStock == true]),
      "totalCategories": count(*[_type == "category"]),
      "totalSubcategories": count(*[_type == "subcategory"]),
      "recentProducts": *[_type == "product"] | order(_createdAt desc) [0...5] {
        _id, title, price, inStock, _createdAt,
        "imageUrl": images[0].asset->url
      }
    }`;
    return await client.fetch(query);
  } catch {
    return { totalProducts: 0, inStockProducts: 0, totalCategories: 0, totalSubcategories: 0, recentProducts: [] };
  }
}

export default async function AdminDashboard() {
  await verifyAdmin();
  const stats = await getDashboardStats();

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'In Stock', value: stats.inStockProducts, icon: Package, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Categories', value: stats.totalCategories, icon: Tag, color: 'bg-amber-50 text-amber-600' },
    { label: 'Subcategories', value: stats.totalSubcategories, icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-widest uppercase text-zinc-900">AMIGO MODA</h1>
          <p className="text-xs text-zinc-500 font-medium">Admin Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100"
          >
            View Store →
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-black text-zinc-900 mb-1">{card.value}</p>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <a
                href={`${process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://amigo-moda.sanity.studio'}/structure/product`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900">Manage Products</p>
                    <p className="text-[10px] text-zinc-500">Add, edit or remove products</p>
                  </div>
                </div>
                <span className="text-zinc-300 group-hover:text-zinc-600 transition-colors">→</span>
              </a>

              <a
                href={`${process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://amigo-moda.sanity.studio'}/structure/category`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Tag className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900">Manage Categories</p>
                    <p className="text-[10px] text-zinc-500">Main & subcategories</p>
                  </div>
                </div>
                <span className="text-zinc-300 group-hover:text-zinc-600 transition-colors">→</span>
              </a>

              <a
                href={`${process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://amigo-moda.sanity.studio'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Settings className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900">Open Sanity Studio</p>
                    <p className="text-[10px] text-zinc-500">Full content management</p>
                  </div>
                </div>
                <span className="text-zinc-300 group-hover:text-zinc-600 transition-colors">→</span>
              </a>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-4">Recent Products</h2>
            {stats.recentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="w-10 h-10 text-zinc-200 mb-3" strokeWidth={1} />
                <p className="text-sm font-bold text-zinc-400">No products yet</p>
                <p className="text-[11px] text-zinc-400 mt-1">Add products via Sanity Studio</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {stats.recentProducts.map((product: any) => (
                  <div key={product._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                      {product.imageUrl && (
                        <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-zinc-900 truncate uppercase">{product.title}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">{product.price?.toLocaleString()} DA</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${product.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {product.inStock ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-zinc-900 text-white rounded-2xl p-5 flex items-center gap-4">
          <Clock className="w-5 h-5 text-[#C9A96E] shrink-0" />
          <div>
            <p className="text-sm font-black">Content is managed via Sanity Studio</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">All products, categories, lookbooks and homepage banners are managed through Sanity CMS. Click "Open Sanity Studio" above to manage content.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
