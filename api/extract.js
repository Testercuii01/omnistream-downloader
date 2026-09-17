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

      if (!ytId) {
        return res.status(400).json({ error: 'ID Video YouTube tidak ditemukan dalam link.' });
      }

      // 1. Coba panggil Cobalt API Instance Utama
      try {
        const cobaltRes = await fetch('https://api.cobalt.tools/api/json', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          },
          body: JSON.stringify({ url: cleanUrl, videoQuality: '720' })
        });

        if (cobaltRes.ok) {
          const cData = await cobaltRes.json();
          if (cData.url) {
            return res.status(200).json({
              status: 'success',
              platform: 'youtube',
              title: `YouTube Video [ID: ${ytId}]`,
              author: '@YouTube',
              thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
              previewUrl: cData.url,
              formats: [
                {
                  label: 'Download Video MP4 (HD 720p)',
                  quality: 'Best Direct Quality',
                  ext: 'mp4',
                  type: 'video',
                  downloadUrl: cData.url
                }
              ]
            });
          }
        }
      } catch (e) {
        console.warn('Cobalt API primary fallback triggered:', e);
      }

      // 2. Fallback Invidious Stream Node dengan ITAG spesifik yang BENAR
      // itag=22 -> 720p MP4 (Video + Audio)
      // itag=18 -> 360p MP4 (Video + Audio)
      // itag=140 -> M4A/MP3 Audio Track
      const invidiousInstances = [
        'https://inv.hostux.net',
        'https://invidious.drgns.space',
        'https://vid.puffyan.us'
      ];

      const invBase = invidiousInstances[Math.floor(Math.random() * invidiousInstances.length)];

      const hdVideoUrl = `${invBase}/latest_version?id=${ytId}&itag=22`;
      const sdVideoUrl = `${invBase}/latest_version?id=${ytId}&itag=18`;
      const audioUrl = `${invBase}/latest_version?id=${ytId}&itag=140`;

      return res.status(200).json({
        status: 'success',
        platform: 'youtube',
        title: `YouTube Video [ID: ${ytId}]`,
        author: '@YouTube',
        thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        previewUrl: sdVideoUrl,
        formats: [
          {
            label: 'Download Video MP4 (HD 720p Direct)',
            quality: '720p HD Stream',
            ext: 'mp4',
            type: 'video',
            downloadUrl: hdVideoUrl
          },
          {
            label: 'Download Video MP4 (SD 360p Direct)',
            quality: '360p Medium Stream',
            ext: 'mp4',
            type: 'video',
            downloadUrl: sdVideoUrl
          },
          {
            label: 'Download Audio Track (MP3/M4A)',
            quality: '320 kbps High Quality',
            ext: 'mp3',
            type: 'audio',
            downloadUrl: audioUrl
          }
        ]
      });
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
        body: JSON.stringify({ url: cleanUrl, videoQuality: '720' })
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
