'use client'
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export default function FeedPage() {
    const [content, setContent] = useState('');
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [likingPost, setLikingPost] = useState<string | null>(null)

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

    const handleCreatePost = async () => {
        if (!content.trim()) return
        setLoading(true)
        const { error } = await supabase
            .from('posts')
            .insert({ content, author_id: user?.id })
        if (error) console.log(error)
        else {
            setContent('')
            fetchPosts()
        }
        setLoading(false)
    }

   
const handleLike = async (postId: string) => {
    if (likingPost === postId) return  // prevent double click!
    setLikingPost(postId)

    const { data: existingLike } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user?.id)
        .eq('post_id', postId)
        .maybeSingle()

    if (existingLike) {
        await supabase.from('likes').delete()
            .eq('user_id', user?.id)
            .eq('post_id', postId)
        await supabase.from('posts')
            .update({ like_count: posts.find(p => p.id === postId)?.like_count - 1 })
            .eq('id', postId)
    } else {
        await supabase.from('likes')
            .insert({ user_id: user?.id, post_id: postId })
        await supabase.from('posts')
            .update({ like_count: posts.find(p => p.id === postId)?.like_count + 1 })
            .eq('id', postId)
    }
    setLikingPost(null)
    fetchPosts()
}
    const handleDelete = async (postId: string) => {
        await supabase.from('posts').delete().eq('id', postId)
        fetchPosts()
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <Card className="p-4 space-y-3">
                <h2 className="font-semibold">Create Post</h2>
                <Textarea
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    maxLength={280}
                />
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{content.length}/280</span>
                    <Button onClick={handleCreatePost} disabled={loading}>
                        {loading ? "Posting..." : "Post"}
                    </Button>
                </div>
            </Card>

            {posts.map(post => (
                <Card key={post.id} className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                            {post.profiles?.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold">@{post.profiles?.username}</span>
                    </div>
                    <p>{post.content}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                            {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} disabled={likingPost === post.id}>
                                ❤️ {post.like_count}
                            </Button>
                            <Button variant="ghost" size="sm">
                                💬 {post.comment_count}
                            </Button>
                            {post.author_id === user?.id && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() => handleDelete(post.id)}
                                >
                                    🗑️ Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}