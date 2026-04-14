import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}