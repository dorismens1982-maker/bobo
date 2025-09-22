import React from 'react'
import { useInvoices } from '../../hooks/useInvoices'
import { useAuth } from '../../hooks/useAuth'
import StatsCard from './StatsCard'
import { FileText, DollarSign, Clock, AlertTriangle, Plus } from 'lucide-react'
import Button from '../common/Button'
import LoadingSpinner from '../common/LoadingSpinner'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { invoices, loading, stats } = useInvoices()
  const { profile } = useAuth()

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />
  }

  const recentInvoices = invoices.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.business_name || 'Business Owner'}!
        </h1>
        <p className="text-green-100">
          Here's what's happening with your invoices today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Invoices"
          value={stats.total}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Total Paid"
          value={`GHS ${stats.paid.toFixed(2)}`}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Pending Amount"
          value={`GHS ${stats.pending.toFixed(2)}`}
          icon={Clock}
          color="orange"
        />
        <StatsCard
          title="Overdue Invoices"
          value={stats.overdue}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/invoices/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
          <Link to="/invoices">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View All Invoices
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="outline">
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
        </div>
        <div className="p-6">
          {recentInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm font-medium text-gray-500">
                    <th className="pb-3">Invoice</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-gray-100">
                      <td className="py-3 font-medium">
                        #{invoice.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-3">{invoice.customer_name}</td>
                      <td className="py-3">GHS {invoice.total_amount.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'sent'
                            ? 'bg-blue-100 text-blue-800'
                            : invoice.status === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-gray-500 mb-4">Create your first invoice to get started.</p>
              <Link to="/invoices/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard