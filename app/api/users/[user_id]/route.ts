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
            .from('profiles')
            .select('*')
            .eq('id', user_id)
            .single()

        if (error) return NextResponse.json({ error: 'User not found' }, { status: 404 })

        const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact' })
            .eq('author_id', user_id)

        return NextResponse.json({ user: { ...data, posts_count: count } }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ user_id: string }> }) {
    try {
        const { user_id } = await params
        const { bio, avatar_url, website, location, username, first_name, last_name } = await req.json()

        if (bio && bio.length > 160) {
            return NextResponse.json({ error: 'Bio must be 160 characters or less' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ bio, avatar_url, website, location, username, first_name, last_name, updated_at: new Date().toISOString() })
            .eq('id', user_id)
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ message: 'Profile updated', user: data }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}