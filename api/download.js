export default async function handler(req, res) {
  const mediaUrl = req.query.url;
  const rawFileName = req.query.filename || 'omnistream_download.mp4';

  if (!mediaUrl) {
    return res.status(400).send('URL media wajib disertakan');
  }

  try {
    // Direct 302 redirect allows client browser to stream directly from CDN
    // preventing 10-second Vercel serverless execution timeout limits
    return res.redirect(302, mediaUrl);
  } catch (error) {
    console.error('Download proxy redirect error:', error);
    return res.redirect(302, mediaUrl);
  }
}
