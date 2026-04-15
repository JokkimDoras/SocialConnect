'use client'
import { useState,useEffect } from "react"
import { supabase } from "@/lib/supabase"
import CommentSection from "./CommentSection"
import { AiFillHeart } from 'react-icons/ai'
import { FaComment, FaTrash,FaEdit } from 'react-icons/fa'
import { CiHeart } from "react-icons/ci";
import Link from "next/link"

interface PostCardProps {
    post: any
    user: any
    onRefresh: () => void
    isFollowing: boolean        
    onFollowChange: () => void  
}

export default function PostCard({ post, user, onRefresh,isFollowing,onFollowChange }: PostCardProps) {
    const [likingPost, setLikingPost] = useState(false)
    const [openComment, setOpenComment] = useState(false)
    const [isLiked ,setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(post.like_count)
    const [editing, setEditing] = useState(false)
    const [editContent, setEditContent] = useState(post.content)
  

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

    const handleEdit = async () => {
        const res = await fetch(`/api/posts/${post.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: editContent, author_id: user?.id })
        })
        const data = await res.json()
        if (data.error) console.log(data.error)
        else {
            setEditing(false)
            onRefresh()
        }
    }

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
        
        
        const res = await fetch(`/api/posts/${post.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author_id: user?.id })
        })
        const data = await res.json()
        
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

<Link href={`/profile/${post.author_id}`} className="font-bold text-gray-800 text-sm hover:underline">
    @{post.profiles?.username}
</Link>                 
       <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                {post.author_id !== user?.id && (
                    <button
                        onClick={handleFollow}
                        className={`text-xs px-4 py-2 rounded font-semibold transition-all ${
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
            {!editing && post.content && (
                <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>
            )}
    
            {/* Edit Form */}
            {editing && (
                <div className="space-y-2">
                    <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        maxLength={280}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setEditing(false)}
                            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 text-sm font-bold bg-[#1877F2] text-white rounded-xl hover:bg-[#166FE5]"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
    
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
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={() => setEditing(!editing)}
                            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blue-500 transition-all"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-500 transition-all"
                        >
                            <FaTrash />
                        </button>
                    </div>
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