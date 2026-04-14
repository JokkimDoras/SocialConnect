import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, error, count } = await supabase
            .from('posts')
            .select(`*, profiles(username, avatar_url)`, { count: 'exact' })
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        return NextResponse.json({
            posts: data,
            pagination: {
                page,
                limit,
                total: count,
                total_pages: Math.ceil((count || 0) / limit)
            }
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}