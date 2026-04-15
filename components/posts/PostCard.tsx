'use client'
import { useState,useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CommentSection from "./CommentSection"
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'
import { FaComment, FaTrash } from 'react-icons/fa'
import { CiHeart } from "react-icons/ci";

interface PostCardProps {
    post: any
    user: any
    onRefresh: () => void
}

export default function PostCard({ post, user, onRefresh }: PostCardProps) {
    const [likingPost, setLikingPost] = useState(false)
    const [openComment, setOpenComment] = useState(false)
    const [isLiked ,setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(post.like_count)

   console.log(post.image_url)
    useEffect(() => {
        const checkLike = async () => {
            const { data } = await supabase
                .from('likes')
                .select('*')
                .eq('user_id', user?.id)
                .eq('post_id', post.id)
                .maybeSingle()
            setIsLiked(!!data)
        }
        if (user?.id) checkLike()
    }, [user?.id])


    const handleLike = async () => {
        if (likingPost) return
        setLikingPost(true)
    
        if (isLiked) {
            await fetch(`/api/posts/${post.id}/like`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.id })
            })
            setIsLiked(false)
            setLikeCount((prev: number) => prev - 1)
        } else {
            await fetch(`/api/posts/${post.id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user?.id })
            })
            setIsLiked(true)
            setLikeCount((prev: number) => prev + 1)
        }
    
        setLikingPost(false)
        onRefresh()
    }

    const handleDelete = async () => {
        console.log('User id:', user?.id)
        console.log('Post author_id:', post.author_id)
        
        const res = await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author_id: user?.id })
        })
        const data = await res.json()
        console.log('Response:', data)
        
        if (data.message === 'Post deleted successfully') {
            onRefresh()  // ← call refresh after successful delete
        }
    }

    return (
        <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                {post.profiles?.avatar_url ? (
        <img 
            src={post.profiles.avatar_url} 
            alt="avatar" 
            className="w-full rounded-2xl h-full object-cover"
        />
    ) : (
        post.profiles?.username?.[0]?.toUpperCase()
    )}                </div>
                <span className="font-semibold">@{post.profiles?.username}</span>
            </div>
            {post.content && <p>{post.content}</p>}

            {post.image_url && (
    <img 
        src={post.image_url} 
        alt="post image" 
        className="w-full rounded-lg object-cover max-h-96"
    />
)}


            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm"
                        onClick={handleLike}
                        disabled={likingPost}>
                            {isLiked? <AiFillHeart className="text-red-500 mr-1"/>:<CiHeart/>}{likeCount}
                    </Button>
                    <Button  variant="ghost" size="sm"
                        onClick={() => setOpenComment(!openComment)}>
                        <FaComment className="text-blue-500 mr-1"/>{post.comment_count}
                    </Button>
                    {post.author_id === user?.id && (
                        <Button variant="ghost" size="sm"
                            className="text-red-500"
                            onClick={handleDelete}>
                            <FaTrash className="mr-1"/> Delete
                        </Button>
                    )}
                </div>
            </div>

            {openComment && (
                <CommentSection
                    postId={post.id}
                    userId={user?.id}
                    onCommentChange={onRefresh}
                />
            )}
        </Card>
    )
}