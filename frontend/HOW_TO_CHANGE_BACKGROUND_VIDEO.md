# How to Change the Background Video

The background video in the hero section can be changed in several ways:

## Option 1: Change the Default Video URL (Easiest)

Edit `frontend/src/components/blocks/food-delivery-hero.tsx` and change line 18:

```typescript
const defaultVideoUrl = "YOUR_NEW_VIDEO_URL_HERE"
```

**Examples:**
- Online video: `"https://example.com/video.mp4"`
- Local video: `"/videos/food-delivery.mp4"` (place file in `public/videos/`)

## Option 2: Use a Local Video File

1. Create a `videos` folder in the `public` directory:
   ```
   frontend/public/videos/
   ```

2. Place your video file there (e.g., `food-hero.mp4`)

3. Update the default URL in `food-delivery-hero.tsx`:
   ```typescript
   const defaultVideoUrl = "/videos/food-hero.mp4"
   ```

## Option 3: Pass Video URL via Props (Dynamic)

In `HomePage.jsx`, you can pass a custom video URL:

```jsx
<FoodDeliveryHero 
  onSearch={handleHeroSearch} 
  videoUrl="https://your-custom-video-url.com/video.mp4"
/>
```

## Option 4: Remove the Video Entirely

Set the default URL to an empty string or `null`:

```typescript
const defaultVideoUrl = "" // or null
```

## Video Requirements

- **Format**: MP4 (recommended), WebM, or OGG
- **Size**: Keep file size reasonable (< 10MB for local files)
- **Aspect Ratio**: 16:9 or 2:3 works best
- **Duration**: Short looping videos work best (5-15 seconds)
- **Codec**: H.264 for best browser compatibility

## Recommended Video Sources

- **Free Stock Videos**: 
  - Pexels Videos: https://www.pexels.com/videos/
  - Pixabay Videos: https://pixabay.com/videos/
  - Unsplash Videos: https://unsplash.com/videos

- **Food Delivery Theme Keywords**:
  - "food delivery", "restaurant", "cooking", "food preparation"

## After Changing

After making changes, rebuild the frontend:

```bash
docker-compose up -d --build frontend
```

Or restart all services:

```bash
docker-compose restart
```

