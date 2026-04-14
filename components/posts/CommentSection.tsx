'use client'
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

interface CommentSectionProps {
    postId: string
    userId: string
    onCommentChange: () => void
}

export default function CommentSection({ postId, userId, onCommentChange }: CommentSectionProps) {
    const [comments, setComments] = useState<any[]>([])
    const [commentText, setCommentText] = useState('')

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('comments')
            .select(`*, profiles(username)`)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })
        if (error) console.log(error)
        else setComments(data || [])
    }

    useState(() => {
        fetchComments()
    })

    const handleComment = async () => {
        if (!commentText.trim()) return
        const { error } = await supabase
            .from('comments')
            .insert({ content: commentText, user_id: userId, post_id: postId })
        if (error) console.log(error)
        else {
            await supabase
                .from('posts')
                .update({ comment_count: comments.length + 1 })
                .eq('id', postId)
            setCommentText('')
            fetchComments()
            onCommentChange()
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        await supabase.from('comments').delete().eq('id', commentId)
        await supabase
            .from('posts')
            .update({ comment_count: comments.length - 1 })
            .eq('id', postId)
        fetchComments()
        onCommentChange()
    }

    return (
        <div className="mt-2 space-y-2 border-t pt-2">
            {comments.map(c => (
                <div key={c.id} className="flex items-start justify-between bg-gray-50 p-2 rounded">
                    <div>
                        <span className="font-semibold text-sm">@{c.profiles?.username}</span>
                        <p className="text-sm">{c.content}</p>
                        <span className="text-xs text-gray-400">
                            {new Date(c.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    {c.user_id === userId && (
                        <Button variant="ghost" size="sm" className="text-red-500"
                            onClick={() => handleDeleteComment(c.id)}>
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
                <Button size="sm" onClick={handleComment}>Submit</Button>
            </div>
        </div>
    )
}