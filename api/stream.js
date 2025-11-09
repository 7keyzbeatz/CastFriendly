import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const masterUrl = req.query.url;
    if (!masterUrl) {
      return res.status(400).send("Missing 'url' query parameter");
    }

    // Fetch the playlist
    const playlistResp = await fetch(masterUrl);
    if (!playlistResp.ok) throw new Error("Failed to fetch master playlist");
    const playlistText = await playlistResp.text();

    // Check if it is a master playlist (EXT-X-STREAM-INF)
    if (playlistText.includes("#EXT-X-STREAM-INF")) {
      // Rewrite nested index.m3u8 URLs
      const newLines = playlistText.split("\n").map(line => {
        if (line.startsWith("http") && line.endsWith("index.m3u8")) {
          // Route through this same function
          return `/api/stream?url=${encodeURIComponent(line)}`;
        }
        return line;
      });
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.status(200).send(newLines.join("\n"));
    } else {
      // This is an index playlist with segments
      const newLines = playlistText.split("\n").map(line => {
        if (line.startsWith("http")) {
          // Route segments through this function as .ts
          const segmentUrl = line;
          const localSegment = `/api/stream?url=${encodeURIComponent(segmentUrl)}&segment=1`;
          return localSegment;
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
