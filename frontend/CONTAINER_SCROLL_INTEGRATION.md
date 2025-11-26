# Container Scroll Animation Integration

## ✅ Project Status

The project already supports:
- ✅ **TypeScript** - Configured in `tsconfig.json`
- ✅ **Tailwind CSS** - Configured in `tailwind.config.js`
- ✅ **shadcn/ui structure** - Components folder exists at `/src/components/ui`
- ✅ **framer-motion** - Already installed (v11.0.0)
- ✅ **Path aliases** - `@/*` configured to point to `./src/*`

## 📁 Component Structure

### Main Component
- **Location**: `frontend/src/components/ui/container-scroll-animation.tsx`
- **Exports**: `ContainerScroll`, `Header`, `Card`

### Demo Components
- **Location**: `frontend/src/components/blocks/hero-scroll-demo.tsx`
- **Location**: `frontend/src/components/blocks/food-delivery-scroll-demo.tsx`

## 🔧 Adaptations Made

### 1. Removed Next.js Dependencies
- ❌ Removed `next/image` import
- ✅ Replaced with standard HTML `<video>` and `<img>` tags
- ✅ Removed `"use client"` directive (not needed in React Router)

### 2. Video/Image Support
- Uses video from `/public/videos/hero-video.mp4` if available
- Falls back to Unsplash stock images
- Supports both video and image props

### 3. TypeScript Compatibility
- All types properly defined
- MotionValue types from framer-motion
- React.ReactNode for children

## 📦 Dependencies

All required dependencies are already installed:
```json
{
  "framer-motion": "^11.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

## 🎨 Usage Examples

### Basic Usage
```tsx
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

<ContainerScroll
  titleComponent={
    <h1 className="text-4xl font-bold">
      Your Title Here
    </h1>
  }
>
  <img src="/your-image.jpg" alt="Content" />
</ContainerScroll>
```

### With Video
```tsx
import { FoodDeliveryScrollDemo } from "@/components/blocks/food-delivery-scroll-demo";

<FoodDeliveryScrollDemo
  title="Experience the Future of"
  subtitle="Food Delivery"
  videoUrl="/videos/hero-video.mp4"
/>
```

### Custom Content
```tsx
<ContainerScroll
  titleComponent={
    <>
      <h1>Custom Title</h1>
      <p>Custom subtitle</p>
    </>
  }
>
  <div className="your-custom-content">
    {/* Any React content */}
  </div>
</ContainerScroll>
```

## 🎯 Component Props

### ContainerScroll
- `titleComponent`: `string | React.ReactNode` - The title/header content
- `children`: `React.ReactNode` - The scrollable content (image/video/custom)

### FoodDeliveryScrollDemo
- `title`: `string` (optional) - Main title text
- `subtitle`: `string` (optional) - Subtitle text (styled with primary color)
- `imageUrl`: `string` (optional) - Fallback image URL
- `videoUrl`: `string` (optional) - Video URL (defaults to `/videos/hero-video.mp4`)

## 🎬 Features

1. **Scroll-based Animation**
   - 3D rotation effect on scroll
   - Scale transformation
   - Smooth translate animations

2. **Responsive Design**
   - Mobile-optimized scale dimensions
   - Adaptive height and padding
   - Touch-friendly interactions

3. **Performance**
   - Uses `useScroll` and `useTransform` from framer-motion
   - Optimized re-renders
   - Hardware-accelerated animations

## 📍 Where to Use

### Recommended Locations:
1. **HomePage** - Replace or enhance the hero section
2. **Restaurant Detail Page** - Showcase restaurant images
3. **Feature Showcase** - Highlight platform features
4. **Landing Pages** - Create engaging scroll experiences

### Example Integration in HomePage:
```tsx
import { FoodDeliveryScrollDemo } from "@/components/blocks/food-delivery-scroll-demo";

// In HomePage component
<FoodDeliveryScrollDemo
  title="Hungry? You're"
  subtitle="in the right place!"
  videoUrl="/videos/hero-video.mp4"
/>
```

## 🖼️ Image Assets

### Current Setup:
- **Video**: `/public/videos/hero-video.mp4` (your Canva video)
- **Fallback Images**: Unsplash stock images (food delivery theme)

### Recommended Unsplash Images:
- Food delivery: `https://images.unsplash.com/photo-1504674900247-087700ff89c6`
- Restaurant: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4`
- Food: `https://images.unsplash.com/photo-1504674900247-087700ff89c6`

## 🚀 Next Steps

1. **Test the Component**
   ```bash
   docker-compose up -d --build frontend
   ```

2. **Integrate into Pages**
   - Add to HomePage for hero section
   - Use in feature showcases
   - Create custom variations

3. **Customize Styling**
   - Adjust colors in Tailwind config
   - Modify animation speeds
   - Change perspective values

## 📝 Notes

- The component uses `"use client"` directive (kept for compatibility)
- All animations are GPU-accelerated via framer-motion
- Mobile detection is handled automatically
- Scroll progress is tracked relative to the container

## 🔍 Troubleshooting

### Video not showing?
- Check file exists in `/public/videos/`
- Verify video format (MP4 recommended)
- Check browser console for errors

### Animation not working?
- Ensure page has enough scroll height
- Check framer-motion is installed
- Verify container ref is properly attached

### Styling issues?
- Check Tailwind classes are compiled
- Verify dark mode classes if using dark theme
- Ensure container has proper height

