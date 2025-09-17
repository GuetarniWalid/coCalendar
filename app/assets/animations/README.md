# Rive Animations Directory

This directory contains all Rive animation files (`.riv`) for the coCalendar app.

## 📁 Current Files

- `progression.riv` - Progress animation used in DayTasksProgress component

## 🔧 How It Works

1. **Add your .riv files here** - Just drop any new Rive animation files into this directory
2. **Automatic copying** - The build process automatically copies all `.riv` files to Android native resources
3. **Use in components** - Reference files by name (without extension) using `resourceName` prop:

```tsx
<Rive resourceName="progression" />  // for progression.riv
<Rive resourceName="my-animation" /> // for my-animation.riv
```

## 🚀 Build Process

The automation script (`scripts/copy-rive-assets.js`) handles copying all `.riv` files from this directory to `android/app/src/main/res/raw/` after prebuild operations.

### Manual Commands:
- `npm run copy-rive-assets` - Copy all .riv files to Android resources
- `npm run prebuild:clean` - Clean prebuild + automatically copy Rive assets

### Adding New Files:
1. Add your `.riv` file to this directory
2. Run `npm run copy-rive-assets` (or it will happen automatically on next prebuild)
3. Use in your components with `<Rive resourceName="filename" />`

## ⚠️ Important Notes

- File names should not contain spaces or special characters
- Use kebab-case or camelCase for file names
- The `resourceName` prop uses the filename WITHOUT the `.riv` extension
- Files are automatically copied after `prebuild --clean` operations

## 📦 Bundle Size Optimization

The build system is optimized to avoid duplicate files:
- ✅ `.riv` files are **excluded** from the main app bundle (`assetBundlePatterns`)
- ✅ Files are **only included** as Android native resources
- ✅ **No duplication** = smaller APK size
- ✅ Better performance with native resource loading
