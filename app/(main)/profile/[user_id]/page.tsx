'use client'
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

export default function UserProfilePage() {
    const params = useParams()
    const userId = params.user_id as string
    const [profile, setProfile] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([])

    useEffect(() => {
        fetchProfile()
        fetchPosts()
    }, [])

    const fetchProfile = async () => {
        const res = await fetch(`/api/users/${userId}`)
        const data = await res.json()
        if (data.user) setProfile(data.user)
    }

    const fetchPosts = async () => {
        const res = await fetch(`/api/posts?author_id=${userId}`)
        const data = await res.json()
        if (data.posts) setPosts(data.posts)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold overflow-hidden border-4 border-white shadow-md">
                            {profile?.avatar_url ? (
                                <img src={profile?.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                profile?.username?.[0]?.toUpperCase()
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">@{profile?.username}</h1>
                            <p className="text-gray-500 text-sm">{profile?.first_name} {profile?.last_name}</p>
                        </div>
                    </div>

                    {profile?.bio && <p className="text-gray-700 text-sm">{profile?.bio}</p>}
                    {profile?.location && <p className="text-gray-500 text-sm">📍 {profile?.location}</p>}
                    {profile?.website && <p className="text-[#1877F2] text-sm">🔗 {profile?.website}</p>}

                    <div className="flex gap-6 pt-2 border-t border-gray-100">
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-800">{posts.length}</p>
                            <p className="text-xs text-gray-500">Posts</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-800">{profile?.followers_count || 0}</p>
                            <p className="text-xs text-gray-500">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-800">{profile?.following_count || 0}</p>
                            <p className="text-xs text-gray-500">Following</p>
                        </div>
                    </div>
                </div>

             
            
               
            </div>
        </div>
    )
}