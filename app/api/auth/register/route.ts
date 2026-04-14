import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
    try {
        const { email, username, password, first_name, last_name } = await req.json()

        // Validate fields
        if (!email || !username || !password) {
            return NextResponse.json(
                { error: 'Email, username and password are required' },
                { status: 400 }
            )
        }

        // Validate username (3-30 chars, alphanumeric + underscore)
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
        if (!usernameRegex.test(username)) {
            return NextResponse.json(
                { error: 'Username must be 3-30 chars, alphanumeric and underscore only' },
                { status: 400 }
            )
        }

        // Check if username already exists
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single()

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 400 }
            )
        }

        // Register user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        // Create profile
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    username,
                    first_name,
                    last_name,
                })
            if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })
        }

        return NextResponse.json({
            message: 'User registered successfully',
            user: data.user
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}