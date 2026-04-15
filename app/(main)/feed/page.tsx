'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import CreatePost from "@/components/posts/CreatePost"
import PostCard from "@/components/posts/PostCard"

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [following, setFollowing] = useState<string[]>([])

    useEffect(() => {
        getUser()
        fetchPosts()
    }, [])

    useEffect(() => {
        if (user?.id) fetchFollowing()
    }, [user?.id])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
    }

    const fetchPosts = async () => {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
    
        // Get list of followed users
        const { data: followData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId)
    
        const followingIds = followData?.map(f => f.following_id) || []
    
        // Include own posts + followed users posts
        const allIds = [...followingIds, userId]
    
        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles(username, avatar_url)`)
            .in('author_id', allIds)
            .order('created_at', { ascending: false })
    
        if (error) console.log(error)
        else setPosts([...(data || [])])
    }
    const fetchFollowing = async () => {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        console.log('Fetching following for:', userId) // add this
        
        if (!userId) return
        
        const { data } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', userId)
        
        const newFollowing = data?.map(f => f.following_id) || []
        console.log('Following:', newFollowing)
        setFollowing([...newFollowing])
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
              isFollowing={following.includes(post.author_id)}
              onFollowChange={fetchFollowing}
          />

            ))}
        </div>
    )
}