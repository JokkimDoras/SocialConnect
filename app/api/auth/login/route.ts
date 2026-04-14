import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

        return NextResponse.json({
            message: 'Login successful',
            access_token: data.session?.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                profile
            }
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}