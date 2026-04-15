'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import CreatePost from "@/components/posts/CreatePost"
import PostCard from "@/components/posts/PostCard"

export default function FeedPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [following, setFollowing] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<'forYou' | 'following'>('forYou')

    useEffect(() => {
        getUser()
    }, [])

    // useEffect(() => {
    //     if (user?.id) fetchFollowing()
    // }, [user?.id])

    useEffect(() => {
        if (user?.id) {
            fetchPosts()
            fetchFollowing()
        }
    }, [user?.id, activeTab])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
    }

    const fetchPosts = async () => {
        const url = activeTab === 'following' 
            ? `/api/feed?filter=following&user_id=${user?.id}`
            : `/api/feed`
    
        const res = await fetch(url)
        const data = await res.json()
        if (data.posts) setPosts([...data.posts])
    }

    const fetchFollowing = async () => {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id
        console.log('Fetching following for:', userId)
        
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* Create Post */}
                <CreatePost userId={user?.id} onPost={fetchPosts} />
    
                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('forYou')}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${
                                activeTab === 'forYou'
                                ? 'border-b-2 border-[#1877F2] text-[#1877F2]'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            For You
                        </button>
                        <button
                            onClick={() => setActiveTab('following')}
                            className={`flex-1 py-3 text-sm font-semibold transition-all ${
                                activeTab === 'following'
                                ? 'border-b-2 border-[#1877F2] text-[#1877F2]'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Following
                        </button>
                    </div>
                </div>
    
                {/* Posts */}
                {posts.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                        <p className="text-gray-400 text-sm">No posts yet!</p>
                    </div>
                )}
    
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
        </div>
    )
}