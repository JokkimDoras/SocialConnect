'use client'
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { IoMdPhotos } from "react-icons/io";


interface CreatePostProps {
    userId: string
    onPost: () => void
}

export default function CreatePost({ userId, onPost }: CreatePostProps) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            alert('Only JPEG and PNG files are allowed!')
            return
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB!')
            return
        }

        setImage(file)
        setImagePreview(URL.createObjectURL(file))
    }

    const handleCreatePost = async () => {
        if (!content.trim()) return
        setLoading(true)
    
        let image_url = null
    
        // Upload image if selected
        if (image) {
            const formData = new FormData()
            formData.append('file', image)
    
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const uploadData = await uploadRes.json()
    
            if (uploadData.error) {
                alert(uploadData.error)
                setLoading(false)
                return
            }
            image_url = uploadData.url
        }
    
        // Create post via API
        const res = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author_id: userId, image_url })
        })
        const data = await res.json()
    
        if (data.error) {
            console.log(data.error)
            setLoading(false)
            return
        }
    
        setContent('')
        setImage(null)
        setImagePreview(null)
        onPost()
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

            {/* Image Preview */}
            {imagePreview && (
    <div className="relative">
        <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-lg" />
        <button
            onClick={() => { 
                setImage(null)
                setImagePreview(null)
                // Reset file input
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                if (fileInput) fileInput.value = ''
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
        >
            ✕
        </button>
    </div>
)}

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-1 text-[#1877F2] text-sm font-semibold hover:underline">
    <IoMdPhotos className="text-lg" />
    <span>Add Image</span>
    <input
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleImageChange}
    />
</label>
                    <span className="text-sm text-gray-400">{content.length}/280</span>
                </div>
                <Button onClick={handleCreatePost} disabled={loading}>
                    {loading ? "Posting..." : "Post"}
                </Button>
            </div>
        </Card>
    )
}