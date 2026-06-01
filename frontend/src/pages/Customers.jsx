import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { customerAPI } from '../services/api'
import Modal from '../components/Modal'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'

const PAGE_SIZE = 10

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

  // Avatar initials
  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title">Customers</h1>
          <p className="section-subtitle">{total} customers registered</p>
        </div>
        <button onClick={openCreate} className="btn-netflix-sm text-sm py-2.5 px-5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-netflix-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-netflix pl-10"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-netflix-gray hover:text-white">✕</button>
        )}
      </div>

      {/* Table */}
      <div className="card-netflix p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-white font-semibold mb-1">No customers found</p>
            <p className="text-netflix-gray text-sm mb-6">{search ? 'Try a different search term' : 'Add your first customer to get started'}</p>
            {!search && <button onClick={openCreate} className="btn-netflix-sm">Add Customer</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-netflix">
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
                        <div className="w-8 h-8 rounded-full bg-netflix-red/20 border border-netflix-red/30 flex items-center justify-center text-netflix-red text-xs font-bold flex-shrink-0">
                          {initials(c.name)}
                        </div>
                        <span className="text-white font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="text-netflix-gray-light">{c.email}</td>
                    <td className="text-netflix-gray-light">{c.phone || <span className="text-netflix-gray">—</span>}</td>
                    <td className="text-netflix-gray-light max-w-xs">
                      <span className="truncate block">{c.address || <span className="text-netflix-gray">—</span>}</span>
                    </td>
                    <td className="text-netflix-gray text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="btn-ghost text-xs py-1.5 px-3">Edit</button>
                        <button onClick={() => setDeleteTarget(c)} className="btn-danger-sm">Delete</button>
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

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCustomer ? 'Edit Customer' : 'Add New Customer'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-netflix-gray-light mb-1.5">Full Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="input-netflix" placeholder="John Doe" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-netflix-gray-light mb-1.5">Email *</label>
            <input type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })} className="input-netflix" placeholder="john@example.com" />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-netflix-gray-light mb-1.5">Phone</label>
            <input {...register('phone')} className="input-netflix" placeholder="+1 234 567 8900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-netflix-gray-light mb-1.5">Address</label>
            <textarea {...register('address')} className="input-netflix resize-none" rows={3} placeholder="Full address" />
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-netflix-dark-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-netflix-sm py-2.5 px-6">
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
