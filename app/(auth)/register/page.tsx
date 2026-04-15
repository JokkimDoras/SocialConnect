'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage () {
    const router = useRouter();
    const [formData,setFormData] = useState({
        email:'',
        password:'',
        username:'',
        first_name:'',
        last_name:'',
    })

    const [error,setError] = useState('');
    const [loading,setLoading] = useState(false);

    const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,[e.target.name]:e.target.value
        })

    }

    const handleRegister = async () => {
      setLoading(true)
      setError('')
  
      if (formData.username.length < 3 || formData.username.length > 30) {
          setError('Username must be between 3 and 30 characters')
          setLoading(false)
          return
      }
  
      // Call API route
      const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
      })
  
      const data = await res.json()
  
      if (!res.ok) {
          setError(data.error)
          setLoading(false)
          return
      }
  
      // Create Supabase session
      const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
      })
  
      if (signInError) {
          setError(signInError.message)
          setLoading(false)
          return
      }
  
      router.push('/feed')
      setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
            {/* Logo */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-[#1877F2]">SocialNetwork</h1>
                <p className="text-gray-500 mt-2">Create an account and join us!</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 text-center">Create Account</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <input
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-blue-100"
                    />
                    <input
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-blue-100"
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-blue-100"
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-blue-100"
                />

                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-400">or</span>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#1877F2] font-semibold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    </div>
)
}