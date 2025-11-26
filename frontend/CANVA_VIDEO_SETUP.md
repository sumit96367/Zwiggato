# How to Use Canva Videos as Background

## Problem
Canva links (like `https://www.canva.com/design/...`) are webpage URLs, not direct video files. The HTML5 `<video>` tag needs a direct link to a video file (`.mp4`, `.webm`, etc.).

## Solution: Download and Use Locally

### Step 1: Download Video from Canva

1. Open your Canva design: https://www.canva.com/design/DAG47cCVNgs/tpjCRKfaJAkY_U_9tQXE4g/watch
2. Click the **"Share"** button (top right)
3. Select **"Download"**
4. Choose **"MP4 Video"** format
5. Click **"Download"**
6. Save the file (e.g., `hero-video.mp4`)

### Step 2: Add Video to Your Project

1. Create the videos folder (if it doesn't exist):
   ```bash
   mkdir frontend/public/videos
   ```

2. Copy your downloaded video file to:
   ```
   frontend/public/videos/hero-video.mp4
   ```

### Step 3: Update the Component

Edit `frontend/src/components/blocks/food-delivery-hero.tsx` and change line 24:

```typescript
const defaultVideoUrl = "/videos/hero-video.mp4"
```

### Step 4: Rebuild Frontend

```bash
docker-compose up -d --build frontend
```

## Alternative: Use Video Hosting Services

If you want to host the video online, use services that provide direct video URLs:

### Option 1: Cloudinary (Free tier available)
1. Upload video to Cloudinary
2. Get direct URL: `https://res.cloudinary.com/your-cloud/video/upload/v1234567/hero-video.mp4`
3. Use this URL in the component

### Option 2: Vimeo
1. Upload to Vimeo
2. Get direct download link (if enabled)
3. Or use Vimeo embed (requires different approach)

### Option 3: YouTube
- YouTube doesn't allow direct video file access
- Would need to use YouTube embed (not ideal for background video)

## Recommended: Use Local File

**Best practice**: Download from Canva and use locally. This gives you:
- ✅ Full control
- ✅ No external dependencies
- ✅ Better performance
- ✅ Works offline
- ✅ No autoplay restrictions

## File Size Tips

- Keep video under 10MB for fast loading
- Use compression if needed (HandBrake, FFmpeg)
- Consider shorter loops (5-15 seconds)

