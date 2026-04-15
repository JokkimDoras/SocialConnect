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
    isFollowing: boolean        // ← add
    onFollowChange: () => void  // ← add
}

export default function PostCard({ post, user, onRefresh,isFollowing,onFollowChange }: PostCardProps) {
    const [likingPost, setLikingPost] = useState(false)
    const [openComment, setOpenComment] = useState(false)
    const [isLiked ,setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(post.like_count)

    useEffect(() => {
        const checkFollow = async () => {
            const { data } = await supabase
                .from('follows')
                .select('*')
                .eq('follower_id', user?.id)
                .eq('following_id', post.author_id)
                .maybeSingle()
        }
        if (user?.id && post.author_id !== user?.id) checkFollow()
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

    const handleFollow = async () => {
        if (isFollowing) {
            await fetch(`/api/users/${post.author_id}/follow`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ follower_id: user?.id })
            })
        } else {
            await fetch(`/api/users/${post.author_id}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ follower_id: user?.id })
            })
        }
        onFollowChange()
    }

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
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold overflow-hidden">
                    {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        post.profiles?.username?.[0]?.toUpperCase()
                    )}
                </div>
                <div>
                    <span className="font-bold text-gray-800 text-sm">@{post.profiles?.username}</span>
                    <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            {post.author_id !== user?.id && (
                <button
                    onClick={handleFollow}
                    className={`text-xs p-2 rounded font-semibold transition-all ${
                        isFollowing
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-[#1877F2] text-white hover:bg-[#166FE5]'
                    }`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}
        </div>

        {/* Content */}
        {post.content && <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>}

        {/* Image */}
        {post.image_url && (
            <img
                src={post.image_url}
                alt="post image"
                className="w-full rounded-xl object-cover max-h-96"
            />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
            <button
                onClick={handleLike}
                disabled={likingPost}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-500 transition-all"
            >
                {isLiked
                    ? <AiFillHeart className="text-red-500 text-lg" />
                    : <CiHeart className="text-lg" />
                }
                <span>{likeCount}</span>
            </button>

            <button
                onClick={() => setOpenComment(!openComment)}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blue-500 transition-all"
            >
                <FaComment className="text-blue-400" />
                <span>{post.comment_count}</span>
            </button>

            {post.author_id === user?.id && (
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-500 transition-all ml-auto"
                >
                    <FaTrash />
                    <span>Delete</span>
                </button>
            )}
        </div>

        {/* Comments */}
        {openComment && (
            <CommentSection
                postId={post.id}
                userId={user?.id}
                onCommentChange={onRefresh}
            />
        )}
    </div>
)
}