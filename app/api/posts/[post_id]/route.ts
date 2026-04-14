import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request, { params }: { params: { post_id: string } }) {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles(username, avatar_url)`)
            .eq('id', params.post_id)
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 404 })
        return NextResponse.json({ post: data }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request, { params }: { params: { post_id: string } }) {
    try {
        const { content, author_id } = await req.json()

        const { data: post } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', params.post_id)
            .single()

        if (post?.author_id !== author_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('posts')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', params.post_id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ message: 'Post updated', post: data }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ post_id: string }> }) {
    try {
        const { post_id } = await params
        const { author_id } = await req.json()

        const { data: post } = await supabase
            .from('posts')
            .select('author_id')
            .eq('id', post_id)
            .single()

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        if (post?.author_id !== author_id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { error } = await supabase.from('posts').delete().eq('id', post_id)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

}