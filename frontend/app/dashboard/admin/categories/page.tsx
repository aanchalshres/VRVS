"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/app/lib/api";

interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface PaginatedResponse {
  data: Category[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => { fetchCategories(); }, [page, search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (search) params.set("search", search);
      const res = await apiGet<PaginatedResponse>(`/admin/categories?${params}`);
      setCategories(res.data ?? []);
      setLastPage(res.last_page ?? 1);
      setTotal(res.total ?? 0);
    } catch (err: any) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setFormName("");
    setFormDesc("");
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditItem(cat);
    setFormName(cat.name);
    setFormDesc(cat.description ?? "");
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { setFormError("Name is required."); return; }
    setSaving(true);
    setFormError("");
    try {
      if (editItem) {
        await apiPut(`/admin/categories/${editItem.id}`, { name: formName.trim(), description: formDesc.trim() || null });
        setSuccessMessage("Category updated.");
      } else {
        await apiPost("/admin/categories", { name: formName.trim(), description: formDesc.trim() || null });
        setSuccessMessage("Category created.");
      }
      setModalOpen(false);
      setTimeout(() => setSuccessMessage(""), 4000);
      await fetchCategories();
    } catch (err: any) {
      setFormError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    try {
      await apiDelete(`/admin/categories/${id}`);
      setSuccessMessage("Category deleted.");
      setTimeout(() => setSuccessMessage(""), 4000);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to delete.");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">{successMessage}</div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#111827]">Categories</h1>
            <p className="text-sm text-[#6B7280]">Manage task categories</p>
          </div>
          <button onClick={openCreate} className="px-4 py-2 text-sm font-medium text-white bg-[#4F46C8] hover:bg-[#4338CA] rounded-lg transition-colors">+ Add Category</button>
        </div>

        <div className="bg-white rounded-xl border border-[#CACDD3] p-4">
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search categories..." className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-5 h-5 border-2 border-[#4F46C8]/30 border-t-[#4F46C8] rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#CACDD3] p-12 text-center">
            <p className="text-sm text-[#6B7280]">No categories found.</p>
            <p className="text-xs text-[#6B7280] mt-1">{search ? "Try a different search term." : "Click above to add your first category."}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#CACDD3] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F0F1F3] text-[#6B7280] text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CACDD3]">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F0F1F3]/50">
                    <td className="px-4 py-3 font-medium text-[#111827]">{cat.name}</td>
                    <td className="px-4 py-3 text-[#6B7280] max-w-xs truncate">{cat.description || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(cat)} className="text-xs text-[#4F46C8] hover:text-[#4338CA] font-medium mr-3">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lastPage > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#CACDD3] text-xs text-[#6B7280]">
                <span>Page {page} of {lastPage} ({total} total)</span>
                <div className="flex gap-2">
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border border-[#CACDD3] rounded hover:bg-[#F0F1F3] disabled:opacity-40">Previous</button>
                  <button disabled={page >= lastPage} onClick={() => setPage(page + 1)} className="px-3 py-1 border border-[#CACDD3] rounded hover:bg-[#F0F1F3] disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#CACDD3] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#CACDD3]">
              <h2 className="text-base font-semibold text-[#111827]">{editItem ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#6B7280] hover:text-[#111827]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Category name" className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8]" />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Description</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} placeholder="Optional description" className="w-full border border-[#CACDD3] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#4F46C8] resize-none" />
              </div>
              {formError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-600">{formError}</div>}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#CACDD3]">
              <button onClick={() => setModalOpen(false)} disabled={saving} className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111827] border border-[#CACDD3] rounded-lg transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-medium text-white bg-[#4F46C8] hover:bg-[#4338CA] rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> : null}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
