# Hymnal Voice Trainer

A mobile-friendly web app for practicing hymn voice parts with real-time pitch detection.

## Features

- **4-Part Harmony Playback** - Play all voice parts (Soprano, Alto, Tenor, Bass) together
- **Solo/Mute Controls** - Isolate or mute individual parts
- **6 Instruments** - Piano, Guitar, Organ, Strings, Flute, Bell
- **Tempo Control** - Speed up or slow down (±5 BPM increments)
- **Key Transposition** - Shift up or down by semitones (±6)
- **Loop Practice Mode** - Loop specific notes to practice difficult passages
- **Real-Time Pitch Detection** - Uses your microphone to detect what note you're singing
- **Visual Feedback** - Green when on pitch, red when off, with cents deviation display
- **Mobile Optimized** - Works great on phones and tablets
- **Add to Home Screen** - Install as an app on iOS/Android
- **Offline Support** - Works without internet once loaded

## Included Hymns

1. Amazing Grace
2. Holy, Holy, Holy
3. Be Thou My Vision

## How to Use

1. Select a hymn
2. Tap on your voice part (Soprano, Alto, Tenor, Bass)
3. Choose an instrument sound
4. Adjust tempo and key if needed
5. Enable Loop mode to practice specific notes
6. Press the play button to hear all parts
7. Tap "Start" to enable pitch detection
8. Sing along and watch the feedback!

**Tip:** Use headphones to prevent the microphone from picking up the speaker output, or tap "Mute Playback" to sing a cappella.

## Add to Home Screen (Install as App)

**iPhone/iPad:**
1. Open in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

**Android:**
1. Open in Chrome
2. Tap the menu (3 dots)
3. Tap "Add to Home screen" or "Install app"

## Files

- `index.html` - Main application
- `manifest.json` - PWA manifest for app installation
- `sw.js` - Service worker for offline support
- `icon-192.png` - App icon (192x192)
- `icon-512.png` - App icon (512x512)

## Hosting on GitHub Pages

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to Settings → Pages
4. Set Source to "Deploy from a branch"
5. Select `main` branch and `/ (root)` folder
6. Click Save
7. Your site will be live at `https://yourusername.github.io/repository-name/`

## Browser Support

- Chrome (recommended)
- Safari
- Firefox
- Edge

Microphone access requires HTTPS or localhost.

## License

Free to use for church and personal use.
