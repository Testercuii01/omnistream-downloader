export default async function handler(req, res) {
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

      // 1. Try Invidious JSON API v1 for direct formatStreams
      const invidiousInstances = [
        'https://inv.hostux.net',
        'https://invidious.drgns.space',
        'https://vid.puffyan.us',
        'https://invidious.nerdvpn.de'
      ];

      for (const invBase of invidiousInstances) {
        try {
          const invRes = await fetch(`${invBase}/api/v1/videos/${ytId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          if (invRes.ok) {
            const data = await invRes.json();
            if (data && data.formatStreams && data.formatStreams.length > 0) {
              const formats = data.formatStreams.map(stream => ({
                label: `Download Video MP4 (${stream.qualityLabel || 'HD'})`,
                quality: stream.qualityLabel || 'Direct Stream',
                ext: stream.container || 'mp4',
                type: 'video',
                downloadUrl: stream.url
              }));

              if (data.adaptiveFormats) {
                const audioStream = data.adaptiveFormats.find(f => f.type && f.type.includes('audio'));
                if (audioStream && audioStream.url) {
                  formats.push({
                    label: 'Download Audio Track (MP3/M4A)',
                    quality: 'High Quality Audio',
                    ext: 'mp3',
                    type: 'audio',
                    downloadUrl: audioStream.url
                  });
                }
              }

              return res.status(200).json({
                status: 'success',
                platform: 'youtube',
                title: data.title || `YouTube Video [ID: ${ytId}]`,
                author: data.author ? `@${data.author}` : '@YouTube',
                thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
                previewUrl: formats[0]?.downloadUrl || '',
                formats: formats
              });
            }
          }
        } catch (e) {
          console.warn('Invidious instance fetch attempt error:', e);
        }
      }

      // 2. Primary Cobalt Fallback
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
          const streamUrl = cData.url || (cData.picker && cData.picker[0]?.url);
          if (streamUrl) {
            return res.status(200).json({
              status: 'success',
              platform: 'youtube',
              title: `YouTube Video [ID: ${ytId}]`,
              author: '@YouTube',
              thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
              previewUrl: streamUrl,
              formats: [
                {
                  label: 'Download Video MP4 (Direct Stream)',
                  quality: 'Best Quality',
                  ext: 'mp4',
                  type: 'video',
                  downloadUrl: streamUrl
                }
              ]
            });
          }
        }
      } catch (e) {
        console.warn('Cobalt API fallback error:', e);
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
