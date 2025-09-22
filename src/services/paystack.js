import axios from 'axios'

const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY || 'sk_test_your_secret_key'
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key'

const paystackAPI = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
})

export const initializePayment = async (paymentData) => {
  try {
    const response = await paystackAPI.post('/transaction/initialize', {
      email: paymentData.email,
      amount: paymentData.amount * 100, // Convert to kobo
      currency: 'GHS',
      reference: paymentData.reference,
      callback_url: paymentData.callback_url,
      metadata: {
        invoice_id: paymentData.invoice_id,
        customer_name: paymentData.customer_name
      },
      channels: ['mobile_money', 'card', 'bank_transfer']
    })
    
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data?.message || 'Payment initialization failed' }
  }
}

export const verifyPayment = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`)
    return { data: response.data, error: null }
  } catch (error) {
    return { data: null, error: error.response?.data?.message || 'Payment verification failed' }
  }
}

export const getPaystackPublicKey = () => PAYSTACK_PUBLIC_KEY