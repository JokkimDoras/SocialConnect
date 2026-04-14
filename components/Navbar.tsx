'use client'
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <nav style={{
            background: scrolled 
                ? 'rgba(255,255,255,0.95)' 
                : 'rgba(255,255,255,1)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid #e4e6eb',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.3s ease'
        }}>
            <div style={{
                maxWidth: '1100px',
                margin: '0 auto',
                padding: '0 24px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <Link href="/feed" style={{
                    fontSize: '22px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #1877F2, #0a5dc2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                    textDecoration: 'none'
                }}>
                    SocialNetwork
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link href="/feed" style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        color: pathname === '/feed' ? '#1877F2' : '#65676b',
                        background: pathname === '/feed' ? '#e7f0fd' : 'transparent',
                        transition: 'all 0.2s ease'
                    }}>
                        🏠 Feed
                    </Link>

                    <Link href="/profile" style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        color: pathname === '/profile' ? '#1877F2' : '#65676b',
                        background: pathname === '/profile' ? '#e7f0fd' : 'transparent',
                        transition: 'all 0.2s ease'
                    }}>
                        👤 Profile
                    </Link>

                    <button onClick={handleLogout} style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #1877F2, #0a5dc2)',
                        color: 'white',
                        boxShadow: '0 2px 8px rgba(24,119,242,0.4)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}