import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useInvoices } from '../../hooks/useInvoices'
import Button from '../common/Button'
import Modal from '../common/Modal'
import LoadingSpinner from '../common/LoadingSpinner'
import { Plus, Search, Download, Eye, Trash2, Share, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateInvoicePDF } from '../../services/pdfGenerator'
import { initializePayment } from '../../services/paystack'
import { useAuth } from '../../hooks/useAuth'

const InvoiceList = () => {
  const { invoices, loading, deleteInvoice } = useInvoices()
  const { profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  if (loading) {
    return <LoadingSpinner text="Loading invoices..." />
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDownloadPDF = async (invoice) => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf' })
      const pdf = await generateInvoicePDF(invoice, profile)
      pdf.save(`invoice-${invoice.id.substring(0, 8)}.pdf`)
      toast.success('PDF downloaded successfully', { id: 'pdf' })
    } catch (error) {
      toast.error('Error generating PDF', { id: 'pdf' })
    }
  }

  const handleCreatePaymentLink = async (invoice) => {
    setPaymentLoading(true)
    try {
      const paymentData = {
        email: profile.email,
        amount: invoice.total_amount,
        reference: `INV-${invoice.id.substring(0, 8)}-${Date.now()}`,
        callback_url: `${window.location.origin}/payment/callback`,
        invoice_id: invoice.id,
        customer_name: invoice.customer_name
      }

      const { data, error } = await initializePayment(paymentData)
      
      if (error) {
        toast.error(error)
        return
      }

      // Copy payment link to clipboard
      if (data.data.authorization_url) {
        await navigator.clipboard.writeText(data.data.authorization_url)
        toast.success('Payment link copied to clipboard!')
        
        // Open WhatsApp with pre-filled message
        const whatsappMessage = `Hi ${invoice.customer_name}, here's your invoice payment link: ${data.data.authorization_url}`
        const whatsappUrl = `https://wa.me/${invoice.customer_phone.replace(/\+/, '')}?text=${encodeURIComponent(whatsappMessage)}`
        window.open(whatsappUrl, '_blank')
      }
    } catch (error) {
      toast.error('Error creating payment link')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedInvoice) return
    
    const result = await deleteInvoice(selectedInvoice.id)
    if (result.success) {
      setShowDeleteModal(false)
      setSelectedInvoice(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage your invoices and payments</p>
        </div>
        <Link to="/invoices/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-500 border-b border-gray-200">
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        #{invoice.id.substring(0, 8).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{invoice.customer_name}</div>
                        <div className="text-sm text-gray-500">{invoice.customer_phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      GHS {invoice.total_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice)}
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        {invoice.status !== 'paid' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleCreatePaymentLink(invoice)}
                            loading={paymentLoading}
                            title="Create Payment Link"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setShowDeleteModal(true)
                          }}
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-6">Create your first invoice to get started.</p>
            <Link to="/invoices/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Invoice"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this invoice? This action cannot be undone.
          </p>
          {selectedInvoice && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium">Invoice #{selectedInvoice.id.substring(0, 8).toUpperCase()}</p>
              <p className="text-sm text-gray-600">Customer: {selectedInvoice.customer_name}</p>
              <p className="text-sm text-gray-600">Amount: GHS {selectedInvoice.total_amount.toFixed(2)}</p>
            </div>
          )}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default InvoiceList