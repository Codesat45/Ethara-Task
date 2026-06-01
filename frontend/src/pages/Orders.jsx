import { useEffect, useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { orderAPI, customerAPI, productAPI } from '../services/api'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'

const PAGE_SIZE = 10

const STATUS_STYLES = {
  pending:   'bg-yellow-900/40 text-yellow-400 border border-yellow-800/40',
  confirmed: 'bg-blue-900/40 text-blue-400 border border-blue-800/40',
  shipped:   'bg-purple-900/40 text-purple-400 border border-purple-800/40',
  delivered: 'bg-green-900/40 text-green-400 border border-green-800/40',
  cancelled: 'bg-red-900/40 text-red-400 border border-red-800/40',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOrder, setDetailOrder] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loadingMeta, setLoadingMeta] = useState(false)

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: { customer_id: '', items: [{ product_id: '', quantity: 1 }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = watch('items')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderAPI.getAll({ page, page_size: PAGE_SIZE })
      setOrders(res.data.items)
      setTotal(res.data.total)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const openCreate = async () => {
    reset({ customer_id: '', items: [{ product_id: '', quantity: 1 }] })
    setLoadingMeta(true)
    try {
      const [cRes, pRes] = await Promise.all([
        customerAPI.getAll({ page_size: 200 }),
        productAPI.getAll({ page_size: 200 }),
      ])
      setCustomers(cRes.data.items)
      setProducts(pRes.data.items)
      setCreateOpen(true)
    } catch {
      toast.error('Failed to load customers/products')
    } finally {
      setLoadingMeta(false)
    }
  }

  const openDetail = async (order) => {
    try {
      const res = await orderAPI.getById(order.id)
      setDetailOrder(res.data)
      setDetailOpen(true)
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Calculate estimated total from selected items
  const estimatedTotal = watchedItems?.reduce((sum, item) => {
    const product = products.find(p => String(p.id) === String(item.product_id))
    if (product && item.quantity > 0) return sum + parseFloat(product.price) * parseInt(item.quantity || 0)
    return sum
  }, 0) || 0

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const payload = {
        customer_id: parseInt(data.customer_id),
        items: data.items.map((i) => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      }
      await orderAPI.create(payload)
      toast.success('Order created successfully')
      setCreateOpen(false)
      fetchOrders()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await orderAPI.delete(deleteTarget.id)
      toast.success('Order deleted — stock restored')
      setDeleteTarget(null)
      fetchOrders()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Orders</h1>
          <p className="section-subtitle">{total} orders total</p>
        </div>
        <button onClick={openCreate} disabled={loadingMeta} className="btn-netflix-sm text-sm py-2.5 px-5">
          {loadingMeta ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          Create Order
        </button>
      </div>

      {/* Table */}
      <div className="card-netflix p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-white font-semibold mb-1">No orders yet</p>
            <p className="text-netflix-gray text-sm mb-6">Create your first order to get started</p>
            <button onClick={openCreate} className="btn-netflix-sm">Create Order</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-netflix">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <span className="text-white font-mono font-semibold">#{String(o.id).padStart(4, '0')}</span>
                    </td>
                    <td className="text-netflix-gray-light">{o.customer_name || `Customer #${o.customer_id}`}</td>
                    <td>
                      <span className="badge bg-netflix-dark-3 text-netflix-gray-light border border-netflix-dark-4">
                        {o.items?.length ?? 0} item{o.items?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="text-white font-bold">${parseFloat(o.total_amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge capitalize ${STATUS_STYLES[o.status] || 'bg-netflix-dark-3 text-netflix-gray'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-netflix-gray text-xs">{new Date(o.order_date).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openDetail(o)} className="btn-ghost text-xs py-1.5 px-3">View</button>
                        <button onClick={() => setDeleteTarget(o)} className="btn-danger-sm">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 pb-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={total} pageSize={PAGE_SIZE} />
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Order" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-netflix-gray-light mb-1.5">Customer *</label>
            <select {...register('customer_id', { required: 'Select a customer' })} className="input-netflix">
              <option value="">— Select customer —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
            {errors.customer_id && <p className="text-red-400 text-xs mt-1">{errors.customer_id.message}</p>}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-netflix-gray-light">Order Items *</label>
              <button
                type="button"
                onClick={() => append({ product_id: '', quantity: 1 })}
                className="text-netflix-red hover:text-netflix-red-light text-xs font-medium flex items-center gap-1 transition-colors"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => {
                const selectedProduct = products.find(p => String(p.id) === String(watchedItems?.[index]?.product_id))
                return (
                  <div key={field.id} className="flex gap-2 items-start bg-netflix-dark-2 rounded-lg p-3 border border-netflix-dark-3">
                    <div className="flex-1">
                      <select {...register(`items.${index}.product_id`, { required: 'Select product' })} className="input-netflix text-sm py-2">
                        <option value="">— Select product —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${parseFloat(p.price).toFixed(2)} (Stock: {p.stock_quantity})
                          </option>
                        ))}
                      </select>
                      {errors.items?.[index]?.product_id && (
                        <p className="text-red-400 text-xs mt-0.5">{errors.items[index].product_id.message}</p>
                      )}
                    </div>
                    <div className="w-24">
                      <input
                        type="number" min="1"
                        placeholder="Qty"
                        {...register(`items.${index}.quantity`, { required: true, min: { value: 1, message: 'Min 1' } })}
                        className="input-netflix text-sm py-2 text-center"
                      />
                    </div>
                    {selectedProduct && (
                      <div className="text-xs text-netflix-gray pt-2.5 w-20 text-right">
                        ${(parseFloat(selectedProduct.price) * parseInt(watchedItems?.[index]?.quantity || 0)).toFixed(2)}
                      </div>
                    )}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-netflix-gray hover:text-red-400 transition-colors pt-2.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Estimated total */}
          {estimatedTotal > 0 && (
            <div className="flex items-center justify-between bg-netflix-dark-2 rounded-lg px-4 py-3 border border-netflix-dark-3">
              <span className="text-netflix-gray text-sm">Estimated Total</span>
              <span className="text-white font-bold text-lg">${estimatedTotal.toFixed(2)}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-netflix-dark-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-netflix-sm py-2.5 px-6">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </span>
              ) : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={`Order #${String(detailOrder?.id || '').padStart(4, '0')}`} size="lg">
        {detailOrder && (
          <div className="space-y-5">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Customer', value: detailOrder.customer_name },
                { label: 'Status', value: (
                  <span className={`badge capitalize ${STATUS_STYLES[detailOrder.status] || ''}`}>{detailOrder.status}</span>
                )},
                { label: 'Order Date', value: new Date(detailOrder.order_date).toLocaleString() },
                { label: 'Total Amount', value: (
                  <span className="text-white font-bold text-xl">${parseFloat(detailOrder.total_amount).toFixed(2)}</span>
                )},
              ].map((row) => (
                <div key={row.label} className="bg-netflix-dark-2 rounded-lg p-3 border border-netflix-dark-3">
                  <p className="text-netflix-gray text-xs mb-1">{row.label}</p>
                  <div className="text-netflix-gray-light text-sm">{row.value}</div>
                </div>
              ))}
            </div>

            {/* Items table */}
            <div>
              <h3 className="text-white font-semibold mb-3">Order Items</h3>
              <div className="rounded-lg border border-netflix-dark-3 overflow-hidden">
                <table className="table-netflix">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Unit Price</th>
                      <th className="text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="text-white">{item.product_name}</td>
                        <td><span className="font-mono text-xs bg-netflix-dark-3 px-2 py-0.5 rounded">{item.product_sku}</span></td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">${parseFloat(item.price).toFixed(2)}</td>
                        <td className="text-right text-white font-semibold">
                          ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end px-4 py-3 border-t border-netflix-dark-3 bg-netflix-dark-2">
                  <div className="text-right">
                    <span className="text-netflix-gray text-sm mr-4">Total</span>
                    <span className="text-white font-black text-xl">${parseFloat(detailOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Order"
        message={`Delete Order #${String(deleteTarget?.id || '').padStart(4, '0')}? Stock will be automatically restored.`}
      />
    </div>
  )
}
