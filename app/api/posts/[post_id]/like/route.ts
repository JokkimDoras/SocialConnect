import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request, { params }: { params: { post_id: string } }) {
    try {
        const { user_id } = await req.json()

        const { data: existing } = await supabase
            .from('likes')
            .select('*')
            .eq('user_id', user_id)
            .eq('post_id', params.post_id)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: 'Already liked' }, { status: 400 })
        }

        await supabase.from('likes').insert({ user_id, post_id: params.post_id })

        const { data: post } = await supabase.from('posts').select('like_count').eq('id', params.post_id).single()
        await supabase.from('posts').update({ like_count: (post?.like_count || 0) + 1 }).eq('id', params.post_id)

        return NextResponse.json({ message: 'Post liked successfully' }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { post_id: string } }) {
    try {
        const { user_id } = await req.json()

        await supabase.from('likes').delete()
            .eq('user_id', user_id)
            .eq('post_id', params.post_id)

        const { data: post } = await supabase.from('posts').select('like_count').eq('id', params.post_id).single()
        await supabase.from('posts').update({ like_count: Math.max((post?.like_count || 0) - 1, 0) }).eq('id', params.post_id)

        return NextResponse.json({ message: 'Post unliked successfully' }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}