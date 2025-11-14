# Background Images

This folder should contain background images for different biomes.

## Adding Background Images

1. Place your background images in this folder
2. Update the `image` property in `src/systems/backgroundSystem.js` for each biome

### Example:
```javascript
plains: {
    name: 'Plains',
    image: 'assets/backgrounds/plains.jpg',  // Add your image path here
    // ... rest of configuration
}
```

## Recommended Image Specifications

- **Resolution**: 1920x1080 or higher
- **Format**: JPG or PNG
- **Size**: Keep under 500KB for performance
- **Style**: Slightly blurred/atmospheric to match the game aesthetic

## Biome Image Files

The following images can be added:
- `plains.jpg` - Rolling grasslands with blue sky
- `forest.jpg` - Dense forest with green canopy
- `mountains.jpg` - Snow-capped mountain peaks
- `desert.jpg` - Sandy dunes with warm tones
- `coast.jpg` - Ocean coastline with beach
- `swamp.jpg` - Murky swamp with dark water
- `tundra.jpg` - Icy landscape with snow
- `urban.jpg` - City skyline or ruins
- `industrial.jpg` - Factories and machinery

## Current Setup

Currently, the system uses CSS gradient backgrounds as placeholders. These provide a good visual experience without requiring image assets. You can keep these gradients or replace them with actual images.
