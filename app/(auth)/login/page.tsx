'use client'
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        setError('')

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json()

        if (!res.ok) {
            setError(data.error)
            setLoading(false)
            return
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
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
                    <p className="text-gray-500 mt-2">Connect with friends and the world</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Welcome back!</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-blue-100"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
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
                            Don't have an account?{' '}
                            <Link href="/register" className="text-[#1877F2] font-semibold hover:underline">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}