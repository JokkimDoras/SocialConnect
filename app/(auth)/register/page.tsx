'use client'
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button, } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

    const handleRegister = async() => {
        setLoading(true)
        setError('')


        if(formData.username.length<5 || formData.username.length >30){
            setError("UserName must be between 3 and 30 characters");
            setLoading(false)
            return;
        }
        const { data,error} = await supabase.auth.signUp({
            email:formData.email,
            password:formData.password,
        })
        if(error){
            setError(error.message)
            setLoading(false)
            return;
        }
        if(data.user){
            const { error : profileError } = await supabase.from('profiles').insert({
                id:data.user.id,
                username:formData.username,
                first_name:formData.first_name,
                last_name:formData.last_name,
            })

            if (profileError) {
                setError(profileError.message)
                setLoading(false)
                return
              }

        }

        router.push('/feed')


    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 space-y-4">
                <h1 className="text-2xl font-bold text-center">Create an Account</h1>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
        <Input
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
        />

        <Input
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
        />

        <Input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />

        <Input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />

        <Button className="w-full" onClick={handleRegister} disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </Button>

        <p className="text-center text-sm">Already have an account?{' '}

        <Link href='/login' className="text-blue-500 hover:underline">Login</Link>
        </p>
            </div>
        </div>
    )
}