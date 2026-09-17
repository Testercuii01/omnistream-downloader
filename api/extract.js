export default async function handler(req, res) {
  // Allow CORS requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.method === 'POST' ? req.body?.url : req.query?.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL media tidak boleh kosong' });
  }

  const cleanUrl = url.trim();
  const lowerUrl = cleanUrl.toLowerCase();

  try {
    if (lowerUrl.includes('tiktok.com')) {
      const tikRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`);
      if (tikRes.ok) {
        const tikData = await tikRes.json();
        if (tikData && tikData.data) {
          const d = tikData.data;
          return res.status(200).json({
            status: 'success',
            platform: 'tiktok',
            title: d.title || 'TikTok Video Without Watermark',
            author: d.author ? `@${d.author.unique_id || d.author.nickname}` : '@tiktok',
            thumbnail: d.cover || d.origin_cover,
            previewUrl: d.play,
            formats: [
              {
                label: 'Video MP4 (Tanpa Watermark)',
                quality: 'HD Original',
                ext: 'mp4',
                type: 'video',
                downloadUrl: d.play
              },
              ...(d.hdplay ? [{
                label: 'Video MP4 (Ultra HD)',
                quality: 'Full HD',
                ext: 'mp4',
                type: 'video',
                downloadUrl: d.hdplay
              }] : []),
              ...(d.music ? [{
                label: 'Audio MP3 (Musik Original)',
                quality: '320 kbps',
                ext: 'mp3',
                type: 'audio',
                downloadUrl: d.music
              }] : [])
            ]
          });
        }
      }
    }

    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      const ytIdMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      const ytId = ytIdMatch ? ytIdMatch[1] : null;

      // Try Cobalt API
      try {
        const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          body: JSON.stringify({ url: cleanUrl, videoQuality: '1080' })
        });

        if (cobaltRes.ok) {
          const cData = await cobaltRes.json();
          if (cData.url) {
            return res.status(200).json({
              status: 'success',
              platform: 'youtube',
              title: `YouTube Video [ID: ${ytId || 'Media'}]`,
              author: '@YouTube',
              thumbnail: ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '',
              previewUrl: cData.url,
              formats: [
                {
                  label: 'Download Video MP4 (1080p / HD)',
                  quality: 'Best Quality',
                  ext: 'mp4',
                  type: 'video',
                  downloadUrl: cData.url
                }
              ]
            });
          }
        }
      } catch (e) {
        console.warn('Cobalt API fallback trigger:', e);
      }

      // Fallback via Invidious Stream Node
      if (ytId) {
        const directVideoUrl = `https://invidious.nerdvpn.de/latest_version?id=${ytId}&italic=0&v=mp4`;
        const directAudioUrl = `https://invidious.nerdvpn.de/latest_version?id=${ytId}&italic=0&audio=1`;

        return res.status(200).json({
          status: 'success',
          platform: 'youtube',
          title: `YouTube Video [ID: ${ytId}]`,
          author: '@YouTube',
          thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
          previewUrl: directVideoUrl,
          formats: [
            {
              label: 'Download Direct Video MP4 (HD 720p)',
              quality: '720p Stream',
              ext: 'mp4',
              type: 'video',
              downloadUrl: directVideoUrl
            },
            {
              label: 'Download Audio Track MP3',
              quality: '320 kbps HQ',
              ext: 'mp3',
              type: 'audio',
              downloadUrl: directAudioUrl
            }
          ]
        });
      }
    }

    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      const tweetMatch = cleanUrl.match(/(?:twitter\.com|x\.com)\/(?:[^\/]+)\/status\/(\d+)/i);
      if (tweetMatch && tweetMatch[1]) {
        const vxRes = await fetch(`https://api.vxtwitter.com/status/${tweetMatch[1]}`);
        if (vxRes.ok) {
          const vxData = await vxRes.json();
          const formats = [];
          let previewUrl = '';
          let thumbnail = '';

          if (vxData.media_extended && vxData.media_extended.length > 0) {
            vxData.media_extended.forEach((m, idx) => {
              if (m.type === 'video' || m.type === 'gif') {
                previewUrl = m.url;
                formats.push({
                  label: `Download Video MP4 (${m.type.toUpperCase()})`,
                  quality: 'HD Direct Stream',
                  ext: 'mp4',
                  type: 'video',
                  downloadUrl: m.url
                });
              } else if (m.type === 'image') {
                thumbnail = m.url;
                formats.push({
                  label: `Download Foto HD (${idx + 1})`,
                  quality: 'High Res JPG',
                  ext: 'jpg',
                  type: 'image',
                  downloadUrl: m.url
                });
              }
            });

            return res.status(200).json({
              status: 'success',
              platform: 'twitter',
              title: vxData.text || 'X / Twitter Post',
              author: `@${vxData.user_screen_name || 'twitter'}`,
              thumbnail: thumbnail,
              previewUrl: previewUrl,
              formats: formats
            });
          }
        }
      }
    }

    if (lowerUrl.includes('instagram.com')) {
      const resCobalt = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: cleanUrl, videoQuality: '1080' })
      });

      if (resCobalt.ok) {
        const cData = await resCobalt.json();
        const mediaUrl = cData.url || (cData.picker && cData.picker[0]?.url);
        if (mediaUrl) {
          return res.status(200).json({
            status: 'success',
            platform: 'instagram',
            title: 'Instagram Post / Reel HD',
            author: '@instagram',
            thumbnail: mediaUrl,
            previewUrl: mediaUrl,
            formats: [
              {
                label: 'Download Direct Media (HD MP4)',
                quality: 'HD Original',
                ext: 'mp4',
                type: 'video',
                downloadUrl: mediaUrl
              }
            ]
          });
        }
      }
    }

    return res.status(400).json({ error: 'Gagal mengekstrak media dari link ini. Pastikan link publik.' });

  } catch (error) {
    console.error('Extraction handler error:', error);
    return res.status(500).json({ error: 'Server error saat memproses link media.' });
  }
}
