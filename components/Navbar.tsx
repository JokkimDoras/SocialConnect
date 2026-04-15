'use client'
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"
import { CgProfile } from "react-icons/cg";
import { RiHome6Line } from "react-icons/ri";


export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link href="/feed" className="text-[#1877F2] text-xl font-extrabold  px-3 py-1 rounded-lg tracking-tight">
                    SocialNetwork
                </Link>

                {/* Links */}
                <div className="flex items-center gap-2">
                <Link href="/feed" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        pathname === '/feed'
                        ? 'bg-blue-50 text-[#1877F2]'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                        <RiHome6Line  size={30}/> 
                    </Link>                  
                    <Link href="/profile" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        pathname === '/profile'
                        ? 'bg-blue-50 text-[#1877F2]'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                        <CgProfile  size={30}/> 
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-[#1877F2] text-white hover:bg-[#166FE5] transition-all"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    )
}