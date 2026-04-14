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
        const { data: existingLike } = await supabase
            .from('likes')
            .select('*')
            .eq('user_id', user?.id)
            .eq('post_id', post.id)
            .maybeSingle()

        if (existingLike) {
            await supabase.from('likes').delete()
                .eq('user_id', user?.id)
                .eq('post_id', post.id)
            await supabase.from('posts')
                .update({ like_count: post.like_count - 1 })
                .eq('id', post.id)
                setIsLiked(false)
        } else {
            await supabase.from('likes')
                .insert({ user_id: user?.id, post_id: post.id })
            await supabase.from('posts')
                .update({ like_count: post.like_count + 1 })
                .eq('id', post.id)
                setIsLiked(true)
        }
        setLikingPost(false)
        onRefresh()
    }

    const handleDelete = async () => {
        await supabase.from('posts').delete().eq('id', post.id)
        onRefresh()
    }

    return (
        <Card className="p-4 space-y-2">
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
                    <Button variant="ghost" size="sm"
                        onClick={handleLike}
                        disabled={likingPost}>
                            {isLiked? <AiFillHeart className="text-red-500 mr-1"/>:<CiHeart/>}{post.like_count}
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