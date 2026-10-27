// The 13 minute film. Paste its link between the quotes in `url` — nothing else needs to change.
// Until a link is set, the page shows a "coming soon" frame in the video's place.
//
// The link can be any of:
//   • YouTube   https://youtu.be/VIDEO_ID  or  https://www.youtube.com/watch?v=VIDEO_ID
//   • Vimeo     https://vimeo.com/123456789  (private links like https://vimeo.com/123456789/abcdef work too)
//   • a file    https://your-storage.example.com/our-story.mp4
//
// A video file of this length is far over GitHub's 100 MB limit, so it can't live in this repository; host it on
// Vimeo, YouTube or file storage (Cloudflare R2, Bunny, Vercel Blob…). For a file, export MP4 (H.264 video, AAC
// audio) with "fast start", so phones begin playing straight away instead of waiting for the whole film:
//   ffmpeg -i film.mov -c:v libx264 -crf 23 -preset slow -vf scale=-2:1080 -c:a aac -b:a 128k -movflags +faststart our-story.mp4
// A lighter 720p copy (scale=-2:720) can go in `mobileUrl`; phones then use it and save data.
export const FILM = {
  url: '',
  /** optional: a smaller copy of the file, used on phones */
  mobileUrl: '',
  /** optional: WebVTT subtitles for a video file */
  captionsUrl: '',
  minutes: 13,
}
