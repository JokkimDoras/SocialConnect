'use client'
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"


export default function Navbar () {
    const router = useRouter();

    const handleLogout = async() => {
        await supabase.auth.signOut();
        router.push('/login')
    }

    return (
        <nav className="border-b px-6 py-6 flex items-center justify-between">
            <Link href="/feed">
            SocialConnect
            </Link>
            <div className="flex items-center gap-4" >
                <Link href='/profile' className="text-sm hover:underline">
                Profile
                </Link>
                <Button onClick={handleLogout} variant="outline" size='sm'>
                    Logout
                </Button>
            </div>
        </nav>
    )
}