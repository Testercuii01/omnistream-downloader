export default async function handler(req, res) {
  const mediaUrl = req.query.url;
  const rawFileName = req.query.filename || 'omnistream_download.mp4';

  if (!mediaUrl) {
    return res.status(400).send('URL media wajib disertakan');
  }

  try {
    const mediaResponse = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    if (!mediaResponse.ok) {
      // Fallback direct redirect if fetch fails
      return res.redirect(mediaUrl);
    }

    const contentType = mediaResponse.headers.get('content-type') || 'application/octet-stream';
    const safeFileName = rawFileName.replace(/[^a-zA-Z0-9_.-]/g, '_');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    const buffer = await mediaResponse.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('Download stream proxy error:', error);
    // Safe fallback redirect
    return res.redirect(mediaUrl);
  }
}
