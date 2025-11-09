export const config = {
  runtime: "edge", // Use Edge Runtime (Vercel) - no npm modules needed
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const masterUrl = searchParams.get("url");

    if (!masterUrl) {
      return new Response("Missing url parameter", { status: 400 });
    }

    // Helper to fetch text content
    async function fetchText(url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      return await res.text();
    }

    // Parse path from request
    const pathname = new URL(req.url).pathname;

    // Serve master playlist
    if (pathname.endsWith("/master.m3u8")) {
      let content = await fetchText(masterUrl);
      // Rewrite nested index URLs to local paths
      content = content
        .split("\n")
        .map(line => (line.startsWith("/pl/") ? line : line))
        .join("\n");

      return new Response(content, {
        status: 200,
        headers: { "Content-Type": "application/vnd.apple.mpegurl" },
      });
    }

    // Serve index playlists
    if (pathname.startsWith("/pl/") && pathname.endsWith("/index.m3u8")) {
      const indexPath = pathname
        .substring("/pl/".length, pathname.length - "/index.m3u8".length);
      const remoteIndexUrl = new URL(masterUrl).origin + "/pl/" + indexPath + "/index.m3u8";

      let content = await fetchText(remoteIndexUrl);

      content = content
        .split("\n")
        .map(line => {
          if (line.startsWith("http")) {
            // Convert .html to local .ts path
            const localPath = "/segments/" + line.replace("https://", "").replace(/\//g, "_") + ".ts";
            return localPath;
          }
          return line;
        })
        .join("\n");

      return new Response(content, {
        status: 200,
        headers: { "Content-Type": "application/vnd.apple.mpegurl" },
      });
    }

    // Serve segments as TS
    if (pathname.startsWith("/segments/") && pathname.endsWith(".ts")) {
      const segName = pathname.substring("/segments/".length, pathname.length - ".ts".length);
      let remoteHtmlUrl = "https://" + segName.replace(/_/g, "/");

      const resp = await fetch(remoteHtmlUrl);
      if (!resp.ok) throw new Error(`Segment fetch failed: ${resp.status}`);
      const buffer = await resp.arrayBuffer();

      return new Response(buffer, {
        status: 200,
        headers: { "Content-Type": "video/MP2T" },
      });
    }

    return new Response("Not found", { status: 404 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
