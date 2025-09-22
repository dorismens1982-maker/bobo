import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export const useInvoices = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  })
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Don't proceed if auth is still loading
    if (authLoading) {
      return
    }

    // If auth is done but no user, clear data and stop loading
    if (!user) {
      setInvoices([])
      setStats({
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0
      })
      setLoading(false)
      return
    }

    // User is authenticated, fetch invoices
    fetchInvoices()
    const unsubscribe = subscribeToInvoices()
    
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user, authLoading])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setInvoices(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Error loading invoices')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToInvoices = () => {
    const subscription = supabase
      .channel('invoices')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'invoices',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setInvoices(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setInvoices(prev => 
              prev.map(invoice => 
                invoice.id === payload.new.id ? payload.new : invoice
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setInvoices(prev => 
              prev.filter(invoice => invoice.id !== payload.old.id)
            )
          }
        })
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const calculateStats = (invoicesData) => {
    const stats = invoicesData.reduce((acc, invoice) => {
      acc.total += 1
      if (invoice.status === 'paid') {
        acc.paid += invoice.total_amount
      } else if (invoice.status === 'overdue') {
        acc.overdue += 1
      } else if (invoice.status === 'sent') {
        acc.pending += invoice.total_amount
      }
      return acc
    }, { total: 0, paid: 0, pending: 0, overdue: 0 })

    setStats(stats)
  }

  const createInvoice = async (invoiceData) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          ...invoiceData,
          user_id: user.id,
          status: 'draft',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      toast.success('Invoice created successfully')
      return { success: true, data }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Error creating invoice')
      return { success: false, error: error.message }
    }
  }

  const updateInvoice = async (invoiceId, updates) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Invoice updated successfully')
      return { success: true, data }
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast.error('Error updating invoice')
      return { success: false, error: error.message }
    }
  }

  const deleteInvoice = async (invoiceId) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Invoice deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast.error('Error deleting invoice')
      return { success: false, error: error.message }
    }
  }

  return {
    invoices,
    loading,
    stats,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    fetchInvoices
  }
}