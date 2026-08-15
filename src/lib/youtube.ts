export function getYoutubeEmbedUrl(url: string | null) {

  if (!url) return null;


  try {

    const parsedUrl = new URL(url);


    // youtube.com/watch?v=
    if (
      parsedUrl.hostname.includes("youtube.com") &&
      parsedUrl.searchParams.get("v")
    ) {

      return `https://www.youtube.com/embed/${parsedUrl.searchParams.get("v")}`;

    }


    // youtu.be/videoId
    if (
      parsedUrl.hostname.includes("youtu.be")
    ) {

      return `https://www.youtube.com/embed${parsedUrl.pathname}`;

    }


    // youtube.com/shorts/videoId
    if (
      parsedUrl.pathname.startsWith("/shorts/")
    ) {

      const id = parsedUrl.pathname.split("/")[2];

      return `https://www.youtube.com/embed/${id}`;

    }


    // youtube.com/live/videoId
    if (
      parsedUrl.pathname.startsWith("/live/")
    ) {

      const id = parsedUrl.pathname.split("/")[2];

      return `https://www.youtube.com/embed/${id}`;

    }


    return null;


  } catch {

    return null;

  }

}