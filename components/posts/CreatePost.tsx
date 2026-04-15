'use client'
import { useState } from "react"
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
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <h2 className="font-bold text-gray-800">Create Post</h2>
            
            <textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={e => setContent(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-blue-100 resize-none"
            />
    
            {/* Image Preview */}
            {imagePreview && (
                <div className="relative">
                    <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                    <button
                        onClick={() => {
                            setImage(null)
                            setImagePreview(null)
                            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                            if (fileInput) fileInput.value = ''
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
                    >
                        ✕
                    </button>
                </div>
            )}
    
            <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                <label className="cursor-pointer flex items-center gap-1 text-[#1877F2] text-sm font-semibold hover:opacity-80 transition-all">
                    <IoMdPhotos className="text-xl" />
                    <span>Add Image</span>
                    <input
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                </label>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{content.length}/280</span>
                    <button
                        onClick={handleCreatePost}
                        disabled={loading}
                        className="px-5 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    )
}