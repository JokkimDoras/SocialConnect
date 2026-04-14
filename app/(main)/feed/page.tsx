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
    const [openComment,setOpenComment]=useState<string|null>(null);
    const [comment,setComment]=useState<{[key:string]:any[]}>({})
    const [commentText,setCommentText] = useState('')


    const fetchComments = async (postId:string) => {
       const { data ,error } = await supabase
       .from('comments')
       .select(`*,profiles(username)`)
       .eq('post_id',postId)
       .order('created_at',{ascending:true})

       if(error) console.log(error)
        else setComment(prev => ({...prev,[postId]:data || []}))


    }


    const toggleComments = (postId:string) => {
        if(openComment === postId){
            setOpenComment(null)
        }else{
            setOpenComment(postId)
            fetchComments(postId)
        }
    }

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


    const handleDeleteComment = async (commentId: string, postId: string) => {
        await supabase.from('comments').delete().eq('id', commentId)
        await supabase
            .from('posts')
            .update({ comment_count: posts.find(p => p.id === postId)?.comment_count - 1 })
            .eq('id', postId)
        fetchComments(postId)
        fetchPosts()
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

    const handleComment = async(postId:string) => {
    if(!commentText.trim()) return;

    const { error} = await supabase.from('comments').insert({
        content:commentText,
        user_id:user?.id,
        post_id:postId
    })

    if(error) console.log(error)
        else{
    await supabase
          .from('posts')
          .update({comment_count:posts.find(p => p.id === postId)?.comment_count + 1})
          .eq('id',postId)
          setCommentText('')
          fetchComments(postId)
          fetchPosts()

}
    }
   
const handleLike = async (postId: string) => {
    if (likingPost === postId) return  // to prevent the double click!
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
                    {/* Avatar and username */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                            {post.profiles?.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold">@{post.profiles?.username}</span>
                    </div>
    
                    {/* Post content */}
                    <p>{post.content}</p>
    
                    {/* Buttons row */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                            {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} disabled={likingPost === post.id}>
                                ❤️ {post.like_count}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => toggleComments(post.id)}>
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
    
                    {/* Comments section - OUTSIDE buttons div! */}
                    {openComment === post.id && (
                        <div className="mt-2 space-y-2 border-t pt-2">
                            {(comment[post.id] || []).map(c => (
                                <div key={c.id} className="flex items-start justify-between bg-gray-50 p-2 rounded">
                                    <div>
                                        <span className="font-semibold text-sm">@{c.profiles?.username}</span>
                                        <p className="text-sm">{c.content}</p>
                                        <span className="text-xs text-gray-400">
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {c.user_id === user?.id && (
                                        <Button variant="ghost" size="sm" className="text-red-500"
                                            onClick={() => handleDeleteComment(c.id, post.id)}>
                                            🗑️
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                                <input
                                    className="flex-1 border rounded px-3 py-1 text-sm"
                                    placeholder="Write a comment..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleComment(post.id)}>
                                    Submit
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    )
}