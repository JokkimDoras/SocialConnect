import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req:NextRequest){
    const res = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies:{
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet){
                    cookiesToSet.forEach(({name,value,options}) => 
                    res.cookies.set(name,value,options))
                }
            }
        }
    )

    const { data :{session}} = await supabase.auth.getSession()

    //no session but try to opne feed
    if(!session && req.nextUrl.pathname.startsWith('/feed')) {
        return NextResponse.redirect(new URL('/login',req.url))
    }
    //if no seesion and acces to profile

    if(!session && req.nextUrl.pathname.startsWith('/profile')){
        return NextResponse.redirect(new URL('/login',req.url))
    }

    // if logged in and try to go loin or register

    if( session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')){
        return NextResponse.redirect(new URL('/feed',req.url))
    }

    return res
}

export const config = {
    matcher:['/feed','/profile','/login','/register']
}