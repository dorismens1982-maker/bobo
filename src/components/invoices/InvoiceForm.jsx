import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoices } from '../../hooks/useInvoices'
import { useAuth } from '../../hooks/useAuth'
import Button from '../common/Button'
import { Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

const InvoiceForm = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    items: [{ id: uuidv4(), description: '', quantity: 1, rate: 0 }],
    tax: 0,
    discount: 0,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const { createInvoice } = useInvoices()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const validateGhanaPhone = (phone) => {
    const ghanaPhoneRegex = /^(\+233|0)(20|23|24|25|26|27|28|50|54|55|59)\d{7}$/
    return ghanaPhoneRegex.test(phone.replace(/\s/g, ''))
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal + formData.tax - formData.discount
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateGhanaPhone(formData.customer_phone)) {
      toast.error('Please enter a valid Ghana phone number')
      return
    }

    if (formData.items.some(item => !item.description || item.rate <= 0)) {
      toast.error('Please fill in all item details with valid rates')
      return
    }

    setLoading(true)

    try {
      const subtotal = calculateSubtotal()
      const total = calculateTotal()

      const invoiceData = {
        ...formData,
        subtotal,
        total_amount: total,
        currency: 'GHS'
      }

      const result = await createInvoice(invoiceData)
      
      if (result.success) {
        navigate('/invoices')
      }
    } catch (error) {
      toast.error('Error creating invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tax' || name === 'discount' ? parseFloat(value) || 0 : value
    }))
  }

  const handleItemChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id 
          ? { ...item, [field]: field === 'quantity' || field === 'rate' ? parseFloat(value) || 0 : value }
          : item
      )
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: uuidv4(), description: '', quantity: 1, rate: 0 }]
    }))
  }

  const removeItem = (id) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-600 mt-1">Fill in the details to create a new invoice</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Business Info Preview */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">Invoice From:</h3>
            <p className="text-green-800 font-medium">{profile?.business_name}</p>
            <p className="text-green-700">{profile?.email}</p>
            <p className="text-green-700">{profile?.phone}</p>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleInputChange}
                placeholder="0244123456 or +233244123456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="col-span-12 md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Item description"
                      required
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rate (GHS)
                    </label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-10 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      GHS {(item.quantity * item.rate).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      variant="danger"
                      size="sm"
                      disabled={formData.items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Amount (GHS)
                  </label>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Amount (GHS)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>GHS {calculateSubtotal().toFixed(2)}</span>
                </div>
                {formData.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>GHS {formData.tax.toFixed(2)}</span>
                  </div>
                )}
                {formData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-GHS {formData.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>GHS {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Additional notes for the invoice"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/invoices')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Save className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InvoiceForm