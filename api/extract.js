// ... existing code ...
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      const ytIdMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      const ytId = ytIdMatch ? ytIdMatch[1] : null;

      if (!ytId) {
        return res.status(200).json({ status: 'error', error: 'ID Video YouTube tidak valid.' });
      }

      // 1. Try Piped API Instances (High Reliability for YouTube Streams)
      const pipedInstances = [
        'https://api.piped.video',
        'https://pipedapi.kavin.rocks',
        'https://piped-api.garudalinux.org'
      ];

      for (const pipedBase of pipedInstances) {
        try {
          const pipedRes = await fetch(`${pipedBase}/streams/${ytId}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
          });
          if (pipedRes.ok) {
            const pData = await pipedRes.json();
            if (pData && (pData.videoStreams || pData.audioStreams)) {
              const formats = [];

              if (pData.videoStreams) {
                pData.videoStreams.slice(0, 4).forEach((st) => {
                  if (st.url && st.quality) {
                    formats.push({
                      label: `Video MP4 (${st.quality})`,
                      quality: st.quality || 'HD',
                      ext: 'mp4',
                      type: 'video',
                      downloadUrl: st.url
                    });
                  }
                });
              }

              if (pData.audioStreams && pData.audioStreams.length > 0) {
                const bestAudio = pData.audioStreams[0];
                if (bestAudio && bestAudio.url) {
                  formats.push({
                    label: 'Audio MP3 / M4A (Suara Jernih HQ)',
                    quality: '320 kbps HQ',
                    ext: 'mp3',
                    type: 'audio',
                    downloadUrl: bestAudio.url
                  });
                }
              }

              if (formats.length > 0) {
                return res.status(200).json({
                  status: 'success',
                  platform: 'youtube',
                  title: pData.title || `YouTube Video [ID: ${ytId}]`,
                  author: pData.uploader ? `@${pData.uploader}` : '@YouTube',
                  thumbnail: pData.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
                  previewUrl: formats[0]?.downloadUrl || '',
                  formats: formats
                });
              }
            }
          }
        } catch (e) {
          console.warn('Piped API fetch attempt error:', e);
        }
      }

      // 2. Fallback to Invidious JSON API v1
      const invidiousInstances = [
        'https://inv.hostux.net',
        'https://invidious.drgns.space',
        'https://vid.puffyan.us'
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
    }
// ... existing code ...
    return res.status(200).json({ status: 'error', error: 'Gagal mengekstrak media dari link ini. Pastikan link publik.' });

  } catch (error) {
    console.error('Extraction handler error:', error);
    return res.status(200).json({ status: 'error', error: 'Server error saat memproses link media.' });
  }
}
