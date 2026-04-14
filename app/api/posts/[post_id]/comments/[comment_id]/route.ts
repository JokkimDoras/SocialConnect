import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function DELETE(req: Request, { params }: { params: Promise<{ post_id: string, comment_id: string }> }) {
    try {
        const { post_id, comment_id } = await params
        const { user_id } = await req.json()

        const { data: comment } = await supabase
            .from('comments')
            .select('user_id')
            .eq('id', comment_id)
            .single()

        if (comment?.user_id !== user_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        await supabase.from('comments').delete().eq('id', comment_id)

        const { data: post } = await supabase.from('posts').select('comment_count').eq('id', post_id).single()
        await supabase.from('posts').update({ comment_count: Math.max((post?.comment_count || 0) - 1, 0) }).eq('id', post_id)

        return NextResponse.json({ message: 'Comment deleted' }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}