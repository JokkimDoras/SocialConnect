import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, first_name, last_name, avatar_url, bio, posts_count')
            .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ users: data }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}