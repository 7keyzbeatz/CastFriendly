import fetch from "node-fetch";

// Helper: fetch remote text
async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

// Helper: fetch remote bytes
async function fetchBytes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export default async function handler(req, res) {
  try {
    const remoteUrl = req.query.url;
    if (!remoteUrl) return res.status(400).send("Missing url parameter");

    // Handle master playlist
    if (remoteUrl.endsWith("master.m3u8")) {
      const masterContent = await fetchText(remoteUrl);
      const lines = masterContent.split("\n");
      const newLines = lines.map(line => {
        if (line.startsWith("/pl/")) {
          // Convert relative index paths to full API URLs
          const fullIndexUrl = new URL(
            line,
            remoteUrl.replace(/master\.m3u8$/, "")
          ).href;
          return `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/stream?url=${encodeURIComponent(fullIndexUrl)}`;
        }
        return line;
      });
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.send(newLines.join("\n"));
    }

    // Handle nested index playlists
    if (remoteUrl.endsWith("index.m3u8")) {
      const indexContent = await fetchText(remoteUrl);
      const lines = indexContent.split("\n");
      const newLines = lines.map(line => {
        if (line.startsWith("http")) {
          // Rewrite HTML segments to local .ts API paths
          const localPath = line.replace("https://", "").replace(/\//g, "_") + ".ts";
          return `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/stream?segment=${encodeURIComponent(localPath)}`;
        }
        return line;
      });
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      return res.send(newLines.join("\n"));
    }

    // Serve segment content
    if (req.query.segment) {
      let segName = req.query.segment;
      let remoteHtml = segName.replace(/_/g, "/");
      if (!remoteHtml.startsWith("http")) remoteHtml = "https://" + remoteHtml;
      const content = await fetchBytes(remoteHtml);
      res.setHeader("Content-Type", "video/MP2T");
      return res.send(content);
    }

    res.status(400).send("Invalid request");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error: " + err.message);
  }
}
