# Hero Section Component Integration Guide

## Overview

The Hero Section component has been successfully integrated into the Zwiggato project. This component is a modern, animated hero section with a header navigation, video background, and infinite slider for company logos.

## Project Setup

### ✅ Completed Setup

1. **TypeScript Configuration**
   - Added `tsconfig.json` with path aliases (`@/*` → `./src/*`)
   - Added `tsconfig.node.json` for Vite config
   - Updated `vite.config.js` to support path aliases

2. **shadcn/ui Structure**
   - Created `/src/components/ui/` folder (required for shadcn components)
   - Created `/src/lib/utils.ts` with `cn()` utility function
   - Updated Tailwind config with shadcn/ui color system
   - Updated CSS with shadcn/ui CSS variables

3. **Dependencies Installed**
   - `framer-motion` - Animation library
   - `lucide-react` - Icon library
   - `@radix-ui/react-slot` - For Button component
   - `class-variance-authority` - For component variants
   - `clsx` & `tailwind-merge` - For className utilities
   - `react-use-measure` - For measuring DOM elements
   - `typescript` - TypeScript support

## Component Structure

```
frontend/src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx         # Button component
│   │   ├── infinite-slider.tsx # Infinite slider component
│   │   └── progressive-blur.tsx # Progressive blur effect
│   └── blocks/               # Block components
│       ├── hero-section-5.tsx # Main hero section
│       └── demo.tsx           # Demo/example usage
├── lib/
│   └── utils.ts              # Utility functions (cn)
```

## Why `/components/ui` Folder?

The `/components/ui` folder is the **standard shadcn/ui convention**. This folder structure is important because:

1. **Consistency**: Follows shadcn/ui best practices
2. **Organization**: Separates UI primitives from page-specific components
3. **Reusability**: UI components are meant to be shared across the app
4. **Tooling**: shadcn CLI expects this structure when adding components

## Usage

### Basic Usage

```tsx
import { HeroSection } from "@/components/blocks/hero-section-5"

function MyPage() {
  return <HeroSection />
}
```

### Integration in HomePage

You can replace or add the HeroSection to your HomePage:

```tsx
// frontend/src/pages/HomePage.jsx
import { HeroSection } from "@/components/blocks/hero-section-5"

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      {/* Rest of your homepage content */}
    </div>
  )
}
```

## Component Features

1. **Animated Header**
   - Fixed navigation that changes on scroll
   - Mobile-responsive hamburger menu
   - Login/Sign Up buttons

2. **Hero Content**
   - Large heading and description
   - Call-to-action buttons
   - Video background (with fallback)

3. **Infinite Logo Slider**
   - Smooth infinite scrolling
   - Hover effects for speed control
   - Progressive blur edges

## Customization

### Update Menu Items

Edit the `menuItems` array in `hero-section-5.tsx`:

```tsx
const menuItems = [
    { name: 'Features', href: '/#features' },
    { name: 'Solution', href: '/#solution' },
    // Add more items
]
```

### Update Logo

Replace the `<Logo />` component SVG with your own logo.

### Update Video

Change the video source in the `<video>` tag:

```tsx
<video
    src="YOUR_VIDEO_URL"
    // ... other props
/>
```

### Update Company Logos

Modify the logo images in the `InfiniteSlider` component.

## TypeScript Support

The project now supports TypeScript. You can:

1. Create new `.tsx` files
2. Use TypeScript in existing `.jsx` files (gradual migration)
3. Use path aliases: `@/components/ui/button`

## Next Steps

1. **Test the Component**: Add it to a page and verify it works
2. **Customize**: Update text, colors, and assets to match your brand
3. **Responsive Design**: Test on mobile, tablet, and desktop
4. **Performance**: Optimize video loading if needed

## Troubleshooting

### Path Alias Not Working

If `@/` imports don't work:
1. Restart the Vite dev server
2. Check `vite.config.js` has the alias configured
3. Verify `tsconfig.json` has the paths configured

### TypeScript Errors

If you see TypeScript errors:
1. Run `npm install` to ensure all dependencies are installed
2. Check that `typescript` is in `devDependencies`
3. Restart your IDE/editor

### Styling Issues

If styles don't appear:
1. Verify Tailwind config includes the new color variables
2. Check that `index.css` has the CSS variables
3. Ensure dark mode classes are working if using dark mode

## Notes

- The component uses React Router's `Link` instead of Next.js `Link`
- All animations use `framer-motion` (not `motion/react`)
- The component is fully responsive
- Dark mode support is included via Tailwind's dark mode

