import Layout from '@/components/layout/Layout'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Login = () => {
  const [formData, setFormData] = useState({
    Mobile: '',
    Password: ''
  })

  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })

    // Clear error as user types
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: ''
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.Mobile.trim()) {
      newErrors.Mobile = 'Mobile is required'
    }

    if (!formData.Password.trim()) {
      newErrors.Password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await axios.post('/api/auth/login', formData)

      if (response.data.status) {
        router.push('/')
      } else {
        setMessage(response.data.message)
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className='flex justify-center items-center min-h-screen bg-gray-200'>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col p-12 border border-orange-500 rounded-xl bg-gray-100'>

            <h1 className='text-center text-gray-800 text-2xl font-bold'>Login</h1>

            <input
              onChange={handleChange}
              className='border text-gray-800 rounded-md px-5 pl-3 py-2 mt-5'
              type="number"
              placeholder='Mobile'
              name='Mobile'
              value={formData.Mobile}
            />
            {errors.Mobile && <p className='text-sm text-red-500 mt-1'>{errors.Mobile}</p>}

            <input
              onChange={handleChange}
              className='border text-gray-800 rounded-md px-5 pl-3 py-2 mt-5'
              type="password"
              placeholder='Password'
              name='Password'
              value={formData.Password}
            />
            {errors.Password && <p className='text-sm text-red-500 mt-1'>{errors.Password}</p>}

            <p className='mt-3 text-blue-500 text-xs cursor-pointer'>Forgot password?</p>

            {message && <p className='text-sm text-red-500 mt-3'>{message}</p>}

            <button
              type='submit'
              disabled={loading}
              className={`mt-6 p-2 rounded-md text-white ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500'}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <Link href="/auth/register">
              <p className='mt-3 text-blue-500 text-center text-sm cursor-pointer'>Don't have an account?</p>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default Login
