import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import Button from '../common/Button'

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, profile, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-2xl font-bold text-green-600">Domens</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.business_name || 'Business Name'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link 
                  to="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header