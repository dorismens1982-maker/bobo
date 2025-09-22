import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Dashboard from './components/dashboard/Dashboard'
import InvoiceList from './components/invoices/InvoiceList'
import InvoiceForm from './components/invoices/InvoiceForm'
import Settings from './components/dashboard/Settings'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#16a34a',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Navigate to="/dashboard" replace />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/invoices" element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceList />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/invoices/create" element={
              <ProtectedRoute>
                <Layout>
                  <InvoiceForm />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/payments" element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments</h2>
                    <p className="text-gray-600">Payment history and management coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports</h2>
                    <p className="text-gray-600">Business reports and analytics coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App