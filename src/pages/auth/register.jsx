import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import React, { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'

const Register = () => {
  const [formData, setFormData] = useState({
    Name: '',
    Mobile: '',
    Password: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false) // loading state

  const router = useRouter()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    const { Name, Mobile, Password } = formData

    if (!Name.trim()) {
      return "Name is required"
    }

    if (!/^\d{10}$/.test(Mobile)) {
      return "Mobile number must be 10 digits"
    }

    if (Password.length < 4) {
      return "Password must be at least 4 characters"
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const error = validateForm()
    if (error) {
      setMessage(error)
      return
    }

    setMessage('')
    setLoading(true)  // start loading

    try {
      const response = await axios.post("/api/auth/register", formData)

      if (response.data.status) {
        router.push('/')
      } else {
        setMessage(response.data.message)
      }
    } catch (err) {
      setMessage('Server error. Please try again.')
    } finally {
      setLoading(false)  // stop loading
    }
  }

  return (
    <Layout>
      <div className='flex justify-center bg-gray-200 items-center min-h-screen '>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col p-12 border border-orange-500 rounded-xl bg-gray-100'>

            <h1 className='text-center text-gray-800 text-2xl font-bold'>Register</h1>
            <input onChange={handleChange} className='border text-gray-800 rounded-md px-5 pl-3 py-2 mt-5' type="text" placeholder='Name' name='Name' value={formData.Name} />
            <input onChange={handleChange} className='border text-gray-800 rounded-md px-5 pl-3 py-2 mt-5' type="number" placeholder='Mobile' name='Mobile' value={formData.Mobile} />
            <input onChange={handleChange} className='border text-gray-800 rounded-md px-5 pl-3 py-2 mt-5' type="password" placeholder='Password' name='Password' value={formData.Password} />

            {message && <p className='text-sm text-red-500 mt-2'>{message}</p>}

            <button 
              type='submit' 
              disabled={loading} 
              className={`mt-6 p-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {loading ? 'Loading...' : 'Submit'}
            </button>

            <Link href="/auth/login">
              <p className='mt-3 text-blue-500 text-center text-sm cursor-pointer'>Already have an account?</p>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default Register
