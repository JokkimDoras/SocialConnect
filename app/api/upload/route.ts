import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            return NextResponse.json({ error: 'Only JPEG and PNG files are allowed' }, { status: 400 })
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 })
        }

        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
            .from('Image')
            .upload(fileName, file)

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('Image')
            .getPublicUrl(fileName)

        return NextResponse.json({ 
            message: 'File uploaded successfully',
            url: urlData.publicUrl 
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}