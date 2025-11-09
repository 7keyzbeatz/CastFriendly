// api/stream.js
export default async function handler(req, res) {
  try {
    const url = req.query.url;
    const isSegment = req.query.segment === "1";

    if (!url) {
      return res.status(400).send("Missing 'url' query parameter");
    }

    // Fetch remote content
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Failed to fetch URL");
    
    if (isSegment) {
      // Serve segment as TS
      const arrayBuffer = await resp.arrayBuffer();
      res.setHeader("Content-Type", "video/MP2T");
      return res.status(200).send(Buffer.from(arrayBuffer));
    }

    const text = await resp.text();

    // Detect master vs index playlist
    if (text.includes("#EXT-X-STREAM-INF")) {
      // Master playlist: rewrite index.m3u8 URLs to local API
      const newLines = text.split("\n").map(line => {
        if (line.startsWith("http") && line.endsWith("index.m3u8")) {
          return `/api/stream?url=${encodeURIComponent(line)}`;
        }
        return line;
      });
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.status(200).send(newLines.join("\n"));
    } else {
      // Index playlist: rewrite segments (.html → .ts) to local API
      const newLines = text.split("\n").map(line => {
        if (line.startsWith("http")) {
          return `/api/stream?url=${encodeURIComponent(line)}&segment=1`;
        }
        return line;
      });
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.status(200).send(newLines.join("\n"));
    }

  } catch (err) {
    console.error(err);
    return res.status(500).send("Error: " + err.message);
  }
}
