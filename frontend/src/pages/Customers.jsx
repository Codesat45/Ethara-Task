import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { customerAPI } from '../services/api'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'

const PAGE_SIZE = 10

/* Avatar color palette based on name */
const AVATAR_COLORS = [
  'bg-blue-500/20 border-blue-500/30 text-blue-400',
  'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  'bg-purple-500/20 border-purple-500/30 text-purple-400',
  'bg-amber-500/20 border-amber-500/30 text-amber-400',
  'bg-pink-500/20 border-pink-500/30 text-pink-400',
  'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
]

function getAvatarColor(name) {
  const code = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function initials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await customerAPI.getAll({ page, page_size: PAGE_SIZE, search: search || undefined })
      setCustomers(res.data.items)
      setTotal(res.data.total)
      setTotalPages(res.data.total_pages)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])
  useEffect(() => { setPage(1) }, [search])

  const openCreate = () => {
    setEditCustomer(null)
    reset({ name: '', email: '', phone: '', address: '' })
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditCustomer(c)
    reset({ name: c.name, email: c.email, phone: c.phone || '', address: c.address || '' })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      if (editCustomer) {
        await customerAPI.update(editCustomer.id, data)
        toast.success('Customer updated')
      } else {
        await customerAPI.create(data)
        toast.success('Customer created')
      }
      setModalOpen(false)
      fetchCustomers()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await customerAPI.delete(deleteTarget.id)
      toast.success('Customer deleted')
      setDeleteTarget(null)
      fetchCustomers()
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
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{total} customer{total !== 1 ? 's' : ''} registered</p>
        </div>
        <button onClick={openCreate} className="btn-sm py-2.5 px-5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
          Add Customer
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors text-sm">✕</button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">No customers found</p>
            <p className="text-[#555] text-sm mb-6">{search ? 'Try a different search term' : 'Add your first customer to get started'}</p>
            {!search && <button onClick={openCreate} className="btn-sm">Add Customer</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(c.name)}`}>
                          {initials(c.name)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{c.name}</p>
                          <p className="text-[#444] text-xs">ID #{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[#aaa] text-sm">{c.email}</span>
                    </td>
                    <td>
                      {c.phone
                        ? <span className="text-[#aaa] text-sm">{c.phone}</span>
                        : <span className="text-[#333] text-sm">—</span>
                      }
                    </td>
                    <td>
                      {c.address
                        ? <span className="text-[#aaa] text-sm truncate block max-w-[180px]">{c.address}</span>
                        : <span className="text-[#333] text-sm">—</span>
                      }
                    </td>
                    <td className="text-[#444] text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="btn-ghost text-xs py-1.5 px-3">Edit</button>
                        <button onClick={() => setDeleteTarget(c)} className="btn-danger text-xs py-1.5 px-3">Delete</button>
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

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCustomer ? `Edit — ${editCustomer.name}` : 'Add New Customer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Full Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="input-field"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Email *</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
              })}
              className="input-field"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Phone</label>
            <input
              {...register('phone')}
              className="input-field"
              placeholder="+1 234 567 8900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Address</label>
            <textarea
              {...register('address')}
              className="input-field resize-none"
              rows={3}
              placeholder="Full address"
            />
          </div>
          <div className="flex gap-3 justify-end pt-3 border-t border-[#1a1a1a]">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-sm py-2.5 px-6">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : editCustomer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Customer"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
