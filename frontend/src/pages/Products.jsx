import { useEffect, useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { productAPI } from '../services/api'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'

const PAGE_SIZE = 10

/* ── Stock badge ─────────────────────────────────────────── */
function StockBadge({ qty }) {
  if (qty === 0) return <span className="badge bg-red-900/40 text-red-400 border border-red-800/40">Out of Stock</span>
  if (qty <= 10) return <span className="badge bg-yellow-900/40 text-yellow-400 border border-yellow-800/40">{qty} — Low</span>
  return <span className="badge bg-green-900/40 text-green-400 border border-green-800/40">{qty} in stock</span>
}

/* ── Product image thumbnail ─────────────────────────────── */
function ProductImage({ src, name, size = 'sm' }) {
  const [err, setErr] = useState(false)
  const dim = size === 'sm' ? 'w-10 h-10' : 'w-full h-full'
  if (!src || err) {
    return (
      <div className={`${dim} rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0`}>
        <svg className="w-5 h-5 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className={`${dim} rounded-lg object-cover flex-shrink-0 border border-[#2a2a2a]`}
    />
  )
}

/* ── Image uploader component ────────────────────────────── */
function ImageUploader({ value, onChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(value || null)

  // Sync preview when value changes externally (edit mode)
  useEffect(() => { setPreview(value || null) }, [value])

  const processFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      setPreview(dataUrl)
      onChange(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const onFileChange = (e) => processFile(e.target.files[0])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const clear = (e) => {
    e.stopPropagation()
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-2">
        Product Image
      </label>

      {preview ? (
        /* ── Preview state ── */
        <div className="relative rounded-xl overflow-hidden border border-[#2a2a2a] bg-[#111]" style={{ height: 200 }}>
          <img src={preview} alt="preview" className="w-full h-full object-contain p-2" />
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-[#E50914] hover:bg-[#b20710] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={clear}
              className="bg-[#222] hover:bg-[#333] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors border border-[#333]"
            >
              Remove
            </button>
          </div>
          {/* Remove X button always visible */}
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className="rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 py-10"
          style={{
            borderColor: dragging ? '#E50914' : '#2a2a2a',
            background: dragging ? 'rgba(229,9,20,0.04)' : '#0e0e0e',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[#999] text-sm font-medium">
              {dragging ? 'Drop image here' : 'Click or drag & drop'}
            </p>
            <p className="text-[#555] text-xs mt-1">PNG, JPG, WEBP — max 2 MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  )
}

/* ── Product detail modal ────────────────────────────────── */
function ProductDetailModal({ product, onClose, onEdit }) {
  if (!product) return null
  return (
    <div className="space-y-5">
      {/* Image */}
      <div className="rounded-xl overflow-hidden bg-[#0e0e0e] border border-[#1e1e1e]" style={{ height: 240 }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-4" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#333]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-xs text-[#444]">No image uploaded</p>
          </div>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'SKU',   value: <span className="font-mono text-xs bg-[#1a1a1a] px-2 py-1 rounded border border-[#2a2a2a]">{product.sku}</span> },
          { label: 'Price', value: <span className="text-white font-bold text-lg">${parseFloat(product.price).toFixed(2)}</span> },
          { label: 'Stock', value: <StockBadge qty={product.stock_quantity} /> },
          { label: 'Added', value: new Date(product.created_at).toLocaleDateString() },
        ].map(row => (
          <div key={row.label} className="bg-[#0e0e0e] rounded-lg p-3 border border-[#1a1a1a]">
            <p className="text-[#555] text-xs mb-1">{row.label}</p>
            <div className="text-[#aaa] text-sm">{row.value}</div>
          </div>
        ))}
      </div>

      {product.description && (
        <div className="bg-[#0e0e0e] rounded-lg p-4 border border-[#1a1a1a]">
          <p className="text-[#555] text-xs mb-1">Description</p>
          <p className="text-[#aaa] text-sm leading-relaxed">{product.description}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-[#1a1a1a]">
        <button onClick={onClose} className="btn-ghost flex-1 justify-center">Close</button>
        <button onClick={() => { onClose(); onEdit(product) }} className="btn-sm flex-1 justify-center">
          Edit Product
        </button>
      </div>
    </div>
  )
}

/* ── Main Products page ──────────────────────────────────── */
export default function Products() {
  const [products, setProducts]     = useState([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [viewMode, setViewMode]     = useState('table') // 'table' | 'grid'

  const [modalOpen, setModalOpen]   = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [imageValue, setImageValue] = useState(null)

  const [detailProduct, setDetailProduct] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productAPI.getAll({ page, page_size: PAGE_SIZE, search: search || undefined })
      setProducts(res.data.items)
      setTotal(res.data.total)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(1) }, [search])

  const openCreate = () => {
    setEditProduct(null)
    setImageValue(null)
    reset({ name: '', sku: '', description: '', price: '', stock_quantity: '', image_url: '' })
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    setImageValue(p.image_url || null)
    reset({
      name: p.name, sku: p.sku,
      description: p.description || '',
      price: p.price,
      stock_quantity: p.stock_quantity,
      image_url: p.image_url || '',
    })
    setModalOpen(true)
  }

  const openDetail = (p) => { setDetailProduct(p); setDetailOpen(true) }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        stock_quantity: parseInt(data.stock_quantity),
        image_url: imageValue || null,
      }
      if (editProduct) {
        await productAPI.update(editProduct.id, payload)
        toast.success('Product updated')
      } else {
        await productAPI.create(payload)
        toast.success('Product created')
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productAPI.delete(deleteTarget.id)
      toast.success('Product deleted')
      setDeleteTarget(null)
      fetchProducts()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="anim-fade-in space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{total} products in catalog</p>
        </div>
        <button onClick={openCreate} className="btn-sm py-2.5 px-5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* ── Toolbar: search + view toggle ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, SKU, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white text-sm">✕</button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#111] border border-[#1e1e1e] rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'table' ? 'bg-[#E50914] text-white' : 'text-[#555] hover:text-white'}`}
            title="Table view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-[#E50914] text-white' : 'text-[#555] hover:text-white'}`}
            title="Grid view"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="card text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <p className="text-white font-semibold mb-1">No products found</p>
          <p className="text-[#555] text-sm mb-6">{search ? 'Try a different search term' : 'Add your first product to get started'}</p>
          {!search && <button onClick={openCreate} className="btn-sm">Add Product</button>}
        </div>

      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="group bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#E50914]/30 transition-all duration-300 cursor-pointer"
              style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(229,9,20,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              onClick={() => openDetail(p)}
            >
              {/* Image area */}
              <div className="relative bg-[#111] border-b border-[#1a1a1a]" style={{ height: 140 }}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-3" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-[#222]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </div>
                )}
                {/* Stock badge overlay */}
                <div className="absolute top-2 right-2">
                  <StockBadge qty={p.stock_quantity} />
                </div>
                {/* Action buttons on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(p) }}
                    className="bg-[#E50914] hover:bg-[#b20710] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(p) }}
                    className="bg-[#222] hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border border-[#333]"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-white text-xs font-semibold truncate mb-0.5">{p.name}</p>
                <p className="text-[#555] text-xs font-mono truncate mb-2">{p.sku}</p>
                <p className="text-[#E50914] text-sm font-bold">${parseFloat(p.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

      ) : (
        /* ── TABLE VIEW ── */
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.image_url} name={p.name} size="sm" />
                        <div>
                          <p
                            className="text-white font-medium text-sm cursor-pointer hover:text-[#E50914] transition-colors"
                            onClick={() => openDetail(p)}
                          >
                            {p.name}
                          </p>
                          {p.description && (
                            <p className="text-[#555] text-xs mt-0.5 truncate max-w-[200px]">{p.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-1 rounded text-[#aaa]">
                        {p.sku}
                      </span>
                    </td>
                    <td className="text-white font-semibold">${parseFloat(p.price).toFixed(2)}</td>
                    <td><StockBadge qty={p.stock_quantity} /></td>
                    <td className="text-[#555] text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openDetail(p)} className="btn-ghost text-xs py-1.5 px-3">View</button>
                        <button onClick={() => openEdit(p)} className="btn-ghost text-xs py-1.5 px-3">Edit</button>
                        <button onClick={() => setDeleteTarget(p)} className="btn-danger text-xs py-1.5 px-3">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={PAGE_SIZE} />
          </div>
        </div>
      )}

      {/* Pagination for grid view */}
      {viewMode === 'grid' && products.length > 0 && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={PAGE_SIZE} />
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? `Edit — ${editProduct.name}` : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image uploader — top of form */}
          <ImageUploader
            value={imageValue}
            onChange={(val) => { setImageValue(val); setValue('image_url', val) }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Product Name *</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="input-field"
                placeholder="e.g. Wireless Headphones"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">SKU *</label>
              <input
                {...register('sku', { required: 'SKU is required' })}
                className="input-field"
                placeholder="e.g. WH-001"
              />
              {errors.sku && <p className="text-red-400 text-xs mt-1">{errors.sku.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              {...register('description')}
              className="input-field resize-none"
              rows={2}
              placeholder="Optional product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Price ($) *</label>
              <input
                type="number" step="0.01" min="0.01"
                {...register('price', { required: 'Price required', min: { value: 0.01, message: 'Must be > 0' } })}
                className="input-field"
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Stock Qty *</label>
              <input
                type="number" min="0"
                {...register('stock_quantity', { required: 'Stock required', min: { value: 0, message: 'Cannot be negative' } })}
                className="input-field"
                placeholder="0"
              />
              {errors.stock_quantity && <p className="text-red-400 text-xs mt-1">{errors.stock_quantity.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-[#1a1a1a]">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-sm py-2.5 px-6">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Product Detail Modal ── */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailProduct?.name || 'Product Details'}
        size="md"
      >
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailOpen(false)}
          onEdit={openEdit}
        />
      </Modal>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
