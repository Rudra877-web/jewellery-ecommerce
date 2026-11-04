'use client';

import React, { useState, useEffect } from 'react';
import {
  Gem,
  Search,
  Plus,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  X,
} from 'lucide-react';
import { ProductData, CategoryData } from '@/types/jewellery';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // New product modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    price: '',
    mrp: '',
    stock: '10',
    metal: 'Gold',
    purity: '22K',
    stone: 'None',
    occasion: 'Festive',
    gender: 'Women',
    weightGrams: '5.0',
    images: '/products/gold-floral-ring.jpg',
    isBestseller: false,
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/products?search=${encodeURIComponent(search)}&categoryId=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch {} finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !form.categoryId) {
          setForm((f) => ({ ...f, categoryId: data.categories[0].id }));
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const toggleBestseller = async (id: string, current: boolean) => {
    // optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBestseller: !current } : p))
    );

    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isBestseller: !current }),
      });
    } catch {
      fetchProducts();
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setFeedback(`Product "${form.name}" created successfully.`);
        fetchProducts();
        setForm({
          sku: '',
          name: '',
          description: '',
          categoryId: categories[0]?.id || '',
          price: '',
          mrp: '',
          stock: '10',
          metal: 'Gold',
          purity: '22K',
          stone: 'None',
          occasion: 'Festive',
          gender: 'Women',
          weightGrams: '5.0',
          images: '/products/gold-floral-ring.jpg',
          isBestseller: false,
          status: 'ACTIVE',
        });
      } else {
        alert(data.error || 'Failed to create product');
      }
    } catch {
      alert('Network error saving product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
            Inventory Management
          </span>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            Catalog & Products ({products.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your jewellery creations, override best-seller ranking, and adjust live stock.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by SKU, name, or metal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-stone-500 whitespace-nowrap">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 border border-stone-300 rounded-xl focus:outline-none focus:border-[#D4AF37] bg-white font-medium text-stone-800"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">Loading catalog...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            No products found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Metal / Purity</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Units Sold</th>
                  <th className="p-4 text-center">Best Seller</th>
                  <th className="p-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const img = Array.isArray(p.images)
                    ? p.images[0]
                    : typeof p.images === 'string'
                    ? (p.images as string).split('|')[0]
                    : '';
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={img || FALLBACK_JEWELLERY_IMAGE}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover bg-stone-100 border border-stone-200"
                          onError={handleImageError}
                        />
                        <div className="max-w-xs">
                          <div className="font-semibold text-stone-900 truncate">{p.name}</div>
                          <div className="text-[11px] text-stone-400">{p.stone} • {p.weightGrams}g</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-stone-800">{p.sku}</td>
                      <td className="p-4 text-stone-700">{p.category?.name || 'Unassigned'}</td>
                      <td className="p-4">
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] font-medium text-stone-800">
                          {p.purity} {p.metal}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-stone-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            p.stock > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-stone-700">{p.unitsSold}</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleBestseller(p.id, p.isBestseller)}
                          className={`p-1.5 rounded-full transition-colors ${
                            p.isBestseller
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                              : 'bg-stone-100 text-stone-300 hover:text-stone-500'
                          }`}
                          title="Toggle Bestseller Flag"
                        >
                          <Star className={`w-4 h-4 ${p.isBestseller ? 'fill-current' : ''}`} />
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={`/product/${p.slug}`}
                          target="_blank"
                          className="text-stone-400 hover:text-[#9A7B1C] inline-block p-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Product Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Add New Jewellery Creation
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JM-RNG-088"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navratna Polki Ring"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="52000"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Metal</label>
                  <select
                    value={form.metal}
                    onChange={(e) => setForm({ ...form, metal: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Artificial">Artificial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Purity</label>
                  <select
                    value={form.purity}
                    onChange={(e) => setForm({ ...form, purity: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="24K">24K</option>
                    <option value="22K">22K</option>
                    <option value="18K">18K</option>
                    <option value="14K">14K</option>
                    <option value="925">925 Silver</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Gemstone / Polki</label>
                  <input
                    type="text"
                    value={form.stone}
                    onChange={(e) => setForm({ ...form, stone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Weight (Grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.weightGrams}
                    onChange={(e) => setForm({ ...form, weightGrams: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Image URL(s)</label>
                  <input
                    type="text"
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 font-bold text-xs uppercase tracking-wider rounded-lg"
                >
                  {saving ? 'Saving...' : 'Create Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
