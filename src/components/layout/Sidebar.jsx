import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  CreditCard, 
  BarChart3,
  X
} from 'lucide-react'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/invoices', icon: FileText, label: 'Invoices' },
    { to: '/invoices/create', icon: Plus, label: 'Create Invoice' },
    { to: '/payments', icon: CreditCard, label: 'Payments' },
    { to: '/reports', icon: BarChart3, label: 'Reports' }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <h2 className="text-xl font-bold text-green-600">Domens</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700 border-r-4 border-green-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default Sidebar