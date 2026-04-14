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

export async function POST(req: Request) {
    try {
        const { content, author_id, image_url } = await req.json()

        if (!content || !author_id) {
            return NextResponse.json({ error: 'Content and author_id are required' }, { status: 400 })
        }

        if (content.length > 280) {
            return NextResponse.json({ error: 'Content must be 280 characters or less' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('posts')
            .insert({ content, author_id, image_url, is_active: true })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        return NextResponse.json({ message: 'Post created successfully', post: data }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}