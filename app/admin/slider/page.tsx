'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Trash2, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';
import { HeroSlideData } from '@/types/jewellery';
import { handleImageError, FALLBACK_JEWELLERY_IMAGE } from '@/lib/image-fallback';

export default function AdminSliderPage() {
  const [slides, setSlides] = useState<HeroSlideData[]>([]);
  const [loading, setLoading] = useState(true);

  // New slide form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    ctaText: 'Explore Collection',
    ctaLink: '/category/necklaces',
    imageUrl: '/products/gold-temple-haaram.jpg',
    sortOrder: '1',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/slider');
      const data = await res.json();
      if (data.slides) setSlides(data.slides);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !current } : s))
    );

    try {
      await fetch('/api/admin/slider', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !current }),
      });
    } catch {
      fetchSlides();
    }
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Are you sure you want to remove this hero slide?')) return;

    try {
      await fetch(`/api/admin/slider?id=${id}`, { method: 'DELETE' });
      fetchSlides();
    } catch {}
  };

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/slider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setFeedback('Hero slide added successfully.');
        fetchSlides();
        setForm({
          title: '',
          subtitle: '',
          ctaText: 'Explore Collection',
          ctaLink: '/category/necklaces',
          imageUrl: '',
          sortOrder: '1',
          isActive: true,
        });
      } else {
        alert(data.error || 'Failed to create slide');
      }
    } catch {
      alert('Network error saving slide');
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
            Storefront Presentation
          </span>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            Hero Slider Banners
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Slides configured here appear on the top homepage hero slider with autoplay and swipe controls.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Slides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Preview image */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900">
                <img
                  src={slide.imageUrl || FALLBACK_JEWELLERY_IMAGE}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-stone-950/40" />
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-bold text-[#E6CA65]">
                  Order #{slide.sortOrder}
                </div>
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      slide.isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-stone-600 text-stone-200'
                    }`}
                  >
                    {slide.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Text content */}
              <div className="p-5 space-y-2">
                <h3 className="font-serif text-lg font-semibold text-stone-900 line-clamp-1">
                  {slide.title}
                </h3>
                {slide.subtitle && (
                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {slide.subtitle}
                  </p>
                )}
                <div className="pt-2 flex items-center justify-between text-xs text-stone-600 border-t border-stone-100">
                  <span>CTA: <strong>{slide.ctaText}</strong></span>
                  <span className="text-[11px] text-stone-400 font-mono truncate max-w-[120px]">
                    {slide.ctaLink}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleActive(slide.id, slide.isActive)}
                className="text-xs font-medium text-stone-700 hover:text-stone-900 flex items-center gap-1.5"
              >
                {slide.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{slide.isActive ? 'Hide Slide' : 'Publish'}</span>
              </button>

              <button
                type="button"
                onClick={() => deleteSlide(slide.id)}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-200 pb-3">
              Add New Hero Slide
            </h2>

            <form onSubmit={handleCreateSlide} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Royal Heritage Bridal Collection"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted in 22K Gold and certified uncut polki diamonds."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={form.ctaText}
                    onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-medium text-stone-700 mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={form.ctaLink}
                    onChange={(e) => setForm({ ...form, ctaLink: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#D4AF37] rounded"
                    />
                    <span className="font-medium text-stone-800">Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 font-bold uppercase tracking-wider rounded-lg"
                >
                  {saving ? 'Saving...' : 'Add Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
