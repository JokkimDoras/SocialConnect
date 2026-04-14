'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import CreatePost from "@/components/posts/CreatePost"
import PostCard from "@/components/posts/PostCard"

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        getUser()
        fetchPosts()
    }, [])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
    }

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles(username, avatar_url)`)
            .order('created_at', { ascending: false })
        if (error) console.log(error)
        else setPosts(data || [])
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <CreatePost userId={user?.id} onPost={fetchPosts} />
            {posts.map(post => (
                <PostCard
                    key={post.id}
                    post={post}
                    user={user}
                    onRefresh={fetchPosts}
                />
            ))}
        </div>
    )
}