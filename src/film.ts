// The 13 minute film, played by both pages: the full site's "Watch Our Story" popup and the basic page.
//
// The film is far over GitHub's 100 MB limit for repository files, so its two MP4 copies are attached to the
// repository's "film-v1" release: github.com/vikrampan/Heartisian-Home/releases/tag/film-v1
//
// To move it, replace `url` with any of these (and clear `mobileUrl` for YouTube or Vimeo):
//   • YouTube   https://youtu.be/VIDEO_ID  or  https://www.youtube.com/watch?v=VIDEO_ID
//   • Vimeo     https://vimeo.com/123456789  (private links like https://vimeo.com/123456789/abcdef work too)
//   • a file    https://your-storage.example.com/our-story.mp4
// A file must be MP4 (H.264 video, AAC audio) with "fast start", so phones begin playing without waiting for the
// whole film. These copies were made from the 3840x2560 master with:
//   ffmpeg -i film.mp4 -vf scale=1920:1280 -c:v libx264 -preset veryfast -crf 22 -maxrate 6M -bufsize 12M -g 100 -c:a copy -movflags +faststart heartisan-home-film.mp4
//   ffmpeg -i film.mp4 -vf scale=1080:720 -c:v libx264 -preset veryfast -crf 23 -maxrate 2500k -bufsize 5M -g 100 -c:a copy -movflags +faststart heartisan-home-film-mobile.mp4
const RELEASE = 'https://github.com/vikrampan/Heartisian-Home/releases/download/film-v1'

export const FILM = {
  url: `${RELEASE}/heartisan-home-film.mp4`,
  /** optional: a smaller copy of the file, used on phones */
  mobileUrl: `${RELEASE}/heartisan-home-film-mobile.mp4`,
  /** shown until the film plays; the film itself opens on a black frame */
  posterUrl: '/images/film/poster.webp',
  /** optional: WebVTT subtitles for a video file (this film has its subtitles burned in) */
  captionsUrl: '',
  minutes: 13,
}
