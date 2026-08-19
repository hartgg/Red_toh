const allowedYoutubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

function getYoutubeVideoId(url: URL) {
  if (
    url.hostname === "youtu.be" ||
    url.hostname === "www.youtu.be"
  ) {
    const videoId = url.pathname.split("/").filter(Boolean)[0];
    return videoId ?? null;
  }

  if (
    url.hostname === "youtube.com" ||
    url.hostname === "www.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      return url.searchParams.get("v");
    }

    const pathParts = url.pathname.split("/").filter(Boolean);

    if (
      pathParts[0] === "embed" ||
      pathParts[0] === "shorts" ||
      pathParts[0] === "live"
    ) {
      return pathParts[1] ?? null;
    }
  }

  return null;
}

export function isValidYoutubeUrl(
  value: string | null | undefined
) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      allowedYoutubeHosts.has(url.hostname) &&
      Boolean(getYoutubeVideoId(url))
    );
  } catch {
    return false;
  }
}

export function getYoutubeEmbedUrl(
  value: string | null | undefined
) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (!allowedYoutubeHosts.has(url.hostname)) {
      return null;
    }

    const videoId = getYoutubeVideoId(url);

    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
