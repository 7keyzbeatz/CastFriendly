// api/stream.js
export default async function handler(req, res) {
  try {
    const { url, segment } = req.query;

    // If no URL provided
    if (!url) {
      return res.status(400).send("Missing 'url' query parameter");
    }

    // Fetch remote content
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

    // Detect master playlist (#EXT-X-STREAM-INF)
    if (text.includes("#EXT-X-STREAM-INF")) {
      for (const line of lines) {
        if (line.startsWith("http") && line.endsWith("index.m3u8")) {
          // Rewrite nested index URLs to local Vercel endpoint
          newLines.push(`/api/stream?url=${encodeURIComponent(line)}`);
        } else {
          newLines.push(line);
        }
      }
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.status(200).send(newLines.join("\n"));
    } else {
      // Index playlist: rewrite segments (.html → .ts)
      for (const line of lines) {
        if (line.startsWith("http")) {
          const localPath = `/api/stream?url=${encodeURIComponent(line)}&segment=1`;
          newLines.push(localPath);
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
