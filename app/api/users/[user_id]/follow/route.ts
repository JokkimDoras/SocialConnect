import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request, { params }: { params: Promise<{ user_id: string }> }) {
    try {
        const { user_id } = await params
        const { follower_id } = await req.json()

        if (follower_id === user_id) {
            return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 })
        }

        const { data: existing } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', follower_id)
            .eq('following_id', user_id)
            .maybeSingle()

        if (existing) {
            return NextResponse.json({ error: 'Already following' }, { status: 400 })
        }

        await supabase.from('follows').insert({ follower_id, following_id: user_id })

        // Update counts
        await supabase.from('profiles')
            .update({ followers_count: supabase.rpc('increment') })
            .eq('id', user_id)

        const { data: followingProfile } = await supabase
            .from('profiles').select('following_count').eq('id', follower_id).single()
        await supabase.from('profiles')
            .update({ following_count: (followingProfile?.following_count || 0) + 1 })
            .eq('id', follower_id)

        const { data: followerProfile } = await supabase
            .from('profiles').select('followers_count').eq('id', user_id).single()
        await supabase.from('profiles')
            .update({ followers_count: (followerProfile?.followers_count || 0) + 1 })
            .eq('id', user_id)

        return NextResponse.json({ message: 'Followed successfully' }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ user_id: string }> }) {
    try {
        const { user_id } = await params
        const { follower_id } = await req.json()

        await supabase.from('follows').delete()
            .eq('follower_id', follower_id)
            .eq('following_id', user_id)

        const { data: followingProfile } = await supabase
            .from('profiles').select('following_count').eq('id', follower_id).single()
        await supabase.from('profiles')
            .update({ following_count: Math.max((followingProfile?.following_count || 0) - 1, 0) })
            .eq('id', follower_id)

        const { data: followerProfile } = await supabase
            .from('profiles').select('followers_count').eq('id', user_id).single()
        await supabase.from('profiles')
            .update({ followers_count: Math.max((followerProfile?.followers_count || 0) - 1, 0) })
            .eq('id', user_id)

        return NextResponse.json({ message: 'Unfollowed successfully' }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}