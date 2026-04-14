'use client'
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

interface CreatePostProps {
    userId: string
    onPost: () => void
}

export default function CreatePost({ userId, onPost }: CreatePostProps) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreatePost = async () => {
        if (!content.trim()) return
        setLoading(true)
        const { error } = await supabase
            .from('posts')
            .insert({ content, author_id: userId })
        if (error) console.log(error)
        else {
            setContent('')
            onPost()
        }
        setLoading(false)
    }

    return (
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
    )
}