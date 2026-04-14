import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request, { params }: { params: { post_id: string } }) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select(`*, profiles(username, avatar_url)`)
            .eq('post_id', params.post_id)
            .order('created_at', { ascending: true })

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ comments: data }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request, { params }: { params: { post_id: string } }) {
    try {
        const { content, user_id } = await req.json()

        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

        const { data, error } = await supabase
            .from('comments')
            .insert({ content, user_id, post_id: params.post_id })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        const { data: post } = await supabase.from('posts').select('comment_count').eq('id', params.post_id).single()
        await supabase.from('posts').update({ comment_count: (post?.comment_count || 0) + 1 }).eq('id', params.post_id)

        return NextResponse.json({ message: 'Comment added', comment: data }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}