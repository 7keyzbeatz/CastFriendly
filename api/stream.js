// api/stream.js
export default async function handler(req, res) {
  try {
    const { url, segment } = req.query;

    // Validate URL
    if (!url) return res.status(400).send("Missing 'url' query parameter");

    const fetchResponse = await fetch(url);
    if (!fetchResponse.ok) throw new Error("Failed to fetch URL");

    // Serve segment as TS
    if (segment === "1") {
      const arrayBuffer = await fetchResponse.arrayBuffer();
      res.setHeader("Content-Type", "video/MP2T");
      return res.status(200).send(Buffer.from(arrayBuffer));
    }

    // Get text content (master or index playlist)
    const text = await fetchResponse.text();
    const lines = text.split("\n");
    const newLines = [];

    // Base API URL for rewriting
    const API_BASE = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/stream`;

    if (text.includes("#EXT-X-STREAM-INF")) {
      // Master playlist: rewrite nested index.m3u8 URLs
      for (const line of lines) {
        if (line.endsWith("index.m3u8")) {
          const fullUrl = line.startsWith("http") ? line : new URL(line, url).href;
          newLines.push(`${API_BASE}?url=${encodeURIComponent(fullUrl)}`);
        } else {
          newLines.push(line);
        }
      }
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.status(200).send(newLines.join("\n"));
    } else {
      // Index playlist: rewrite segments (.html → TS)
      for (const line of lines) {
        if (line.startsWith("http")) {
          const fullUrl = line;
          newLines.push(`${API_BASE}?url=${encodeURIComponent(fullUrl)}&segment=1`);
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
