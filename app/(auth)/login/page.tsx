'use client'
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage () {
    const router = useRouter();
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('')
    const [error,setError]=useState('');
    const [loading,setLoading]=useState(false);


    const handleLogin = async () => {
   setLoading(true);
   setError('');


   const {error} = await supabase.auth.signInWithPassword({
    email,
    password
   })


   if(error) {
    setError(error.message)
    setLoading(false)
    return
   }

   router.push('/feed')

    }

    return (
         <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4">
                <h1 className="text-2xl fint-bold text-center">Login to SocialConnect</h1>
                <Input
                className="p-5"
                type="email"
                value={email}
                placeholder="Enter a Valid Email"
                onChange={(e) =>  setEmail(e.target.value)}
                />
                <Input
                className="p-5"
                type="password"
                value={password}
                placeholder="Enter the Password"
                onChange={e => setPassword(e.target.value)}
                />
{error && <p className="text-red-500 text-sm">{error}</p>}                <Button className="w-full p-6 cursor-pointer " onClick={handleLogin} disabled={loading}>
                    Login
                </Button>
                <p className="text-center text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-blue-500 hover:underline">
                    Register
                    </Link>
                </p>
            </div>
        </div>
    )
}