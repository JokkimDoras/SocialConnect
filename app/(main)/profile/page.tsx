'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([])
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false);
    const[avatarFile,setAvatarFile]=useState<File | null>(null);
    const [avatarPreview,setAvatarPreview]=useState<String | null>(null)
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        bio: '',
        website: '',
        location: '',
    })

    useEffect(() => {
        getUser()
    }, [])

    const getUser = async () => {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
        if (data.user) {
            fetchProfile(data.user.id)
            fetchUserPosts(data.user.id)
        }
    }

    const handleAvatarChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if(!file){
            return;
        }
        if(!['image/jpeg','image/png'].includes(file.type)){
            alert('Only JPEG and PNG files are allowed')
            return;
        }
        if(file.size>2 * 1024 *1024) {
            alert('File size must be less then 2MB!')
            return;
        }
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const fetchProfile = async (userId: string) => {
        const res = await fetch(`/api/users/${userId}`)
        const data = await res.json()
        if (data.user) {
            setProfile(data.user)
            setFormData({
                username: data.user.username || '',
                first_name: data.user.first_name || '',
                last_name: data.user.last_name || '',
                bio: data.user.bio || '',
                website: data.user.website || '',
                location: data.user.location || '',
            })
        }
    }

    const fetchUserPosts = async (userId: string) => {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false })

        if (error) console.log(error)
        else setPosts(data || [])
    }

    const handleUpdate = async () => {
        setLoading(true)
    
        let avatar_url = profile?.avatar_url
    
        // Upload avatar if selected
        if (avatarFile) {
            const formData = new FormData()
            formData.append('file', avatarFile)
    
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
            avatar_url = uploadData.url
        }
    
        const res = await fetch(`/api/users/${user?.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, avatar_url })
        })
    
        const data = await res.json()
    
        if (!res.ok) {
            console.log(data.error)
            setLoading(false)
            return
        }
    
        fetchProfile(user?.id)
        setEditing(false)
        setAvatarFile(null)
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            {/* Profile Card */}
            <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold">
                        {avatarPreview || profile?.avatar_url ? (
        <img 
            src={avatarPreview || profile?.avatar_url} 
            alt="avatar" 
            className="w-full h-full object-cover"
        />
    ) : (
        profile?.username?.[0]?.toUpperCase()
    )}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">@{profile?.username}</h1>
                            <p className="text-gray-500">{profile?.first_name} {profile?.last_name}</p>
                        </div>
                    </div>
                    <Button onClick={() => setEditing(!editing)} variant="outline">
                        {editing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                </div>

                {profile?.bio && <p className="text-gray-700">{profile?.bio}</p>}
                {profile?.location && <p className="text-gray-500">📍 {profile?.location}</p>}
                {profile?.website && <p className="text-blue-500">🔗 {profile?.website}</p>}

                <div className="flex gap-4 text-sm text-gray-500">
                    <span><strong>{posts.length}</strong> Posts</span>
                </div>

                {/* Edit Form */}
                {editing && (
                    <div className="space-y-3 border-t pt-4">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                            {avatarPreview || profile?.avatar_url ? (
                                <img src={avatarPreview || profile?.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold">{profile?.username?.[0]?.toUpperCase()}</span>
                            )}
                        </div>
                        <label className="cursor-pointer text-blue-500 text-sm font-semibold hover:underline">
                            📷 Change Avatar
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>
                    <div className="space-y-3 border-t pt-4">
                        <Input
                            placeholder="Username"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                        <Input
                            placeholder="First Name"
                            value={formData.first_name}
                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                        />
                        <Input
                            placeholder="Last Name"
                            value={formData.last_name}
                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                        />
                        <Textarea
                            placeholder="Bio (max 160 chars)"
                            value={formData.bio}
                            maxLength={160}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        />
                        <Input
                            placeholder="Location"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                        <Input
                            placeholder="Website"
                            value={formData.website}
                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                        />
                        <Button onClick={handleUpdate} disabled={loading} className="w-full">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                    </div>
                )}
            </Card>

            {/* User Posts */}
            <h2 className="font-bold text-lg">My Posts</h2>
            {posts.length === 0 && <p className="text-gray-500">No posts yet!</p>}
            {posts.map(post => (
                <Card key={post.id} className="p-4 space-y-2">
                    <p>{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>❤️ {post.like_count}</span>
                        <span>💬 {post.comment_count}</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                </Card>
            ))}
        </div>
    )
}