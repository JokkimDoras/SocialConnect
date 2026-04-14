import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: Promise<{ post_id: string }> }) {
    try {
        const { post_id } = await params
        const { data, error } = await supabase
            .from('comments')
            .select(`*, profiles(username, avatar_url)`)
            .eq('post_id', post_id)
            .order('created_at', { ascending: true })

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ comments: data }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ post_id: string }> }) {
    try {
        const { post_id } = await params
        const { content, user_id } = await req.json()

        if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 })

        const { data, error } = await supabase
            .from('comments')
            .insert({ content, user_id, post_id })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        const { data: post } = await supabase.from('posts').select('comment_count').eq('id', post_id).single()
        await supabase.from('posts').update({ comment_count: (post?.comment_count || 0) + 1 }).eq('id', post_id)

        return NextResponse.json({ message: 'Comment added', comment: data }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}