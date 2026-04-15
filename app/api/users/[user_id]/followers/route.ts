import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request, { params }: { params: Promise<{ user_id: string }> }) {
    try {
        const { user_id } = await params

        const { data, error } = await supabase
            .from('follows')
            .select(`*, profiles!follows_follower_id_fkey(id, username, avatar_url)`)
            .eq('following_id', user_id)

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ followers: data }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}