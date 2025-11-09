// api/stream.js
export default async function handler(req, res) {
  try {
    const { url, segment } = req.query;

    if (!url) return res.status(400).send("Missing 'url' query parameter");

    const fetchResponse = await fetch(url);
    if (!fetchResponse.ok) throw new Error("Failed to fetch URL");

    // CORS headers for Chromecast
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Serve TS segment
    if (segment === "1") {
      const arrayBuffer = await fetchResponse.arrayBuffer();
      res.setHeader("Content-Type", "video/MP2T");
      return res.status(200).send(Buffer.from(arrayBuffer));
    }

    const text = await fetchResponse.text();
    const lines = text.split("\n");
    const newLines = [];

    // Base Vercel API endpoint
    const API_BASE = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/stream`;

    if (text.includes("#EXT-X-STREAM-INF")) {
      // Master playlist: rewrite all nested .m3u8 URLs
      for (const line of lines) {
        if (line.trim().endsWith("index.m3u8")) {
          const fullUrl = line.startsWith("http") ? line : new URL(line, url).href;
          newLines.push(`${API_BASE}?url=${encodeURIComponent(fullUrl)}`);
        } else {
          newLines.push(line);
        }
      }
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.status(200).send(newLines.join("\n"));
    } else {
      // Index playlist: rewrite all segments (.ts)
      for (const line of lines) {
        if (line.trim() && !line.startsWith("#")) {
          const segmentUrl = line.startsWith("http") ? line : new URL(line, url).href;
          newLines.push(`${API_BASE}?url=${encodeURIComponent(segmentUrl)}&segment=1`);
        } else {
          newLines.push(line);
        }
      }
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.status(200).send(newLines.join("\n"));
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send("Error: " + err.message);
  }
}
