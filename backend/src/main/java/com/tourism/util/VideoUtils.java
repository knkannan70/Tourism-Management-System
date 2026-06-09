package com.tourism.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class VideoUtils {

    // Regex to match YouTube URLs
    private static final String YOUTUBE_REGEX = "^(?:https?:\\/\\/)?(?:www\\.)?(?:youtube\\.com\\/(?:[^\\/\\n\\s]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|\\S*?[?&]v=)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})";
    private static final Pattern YOUTUBE_PATTERN = Pattern.compile(YOUTUBE_REGEX);

    public static String extractThumbnailUrl(String videoUrl) {
        if (videoUrl == null || videoUrl.trim().isEmpty()) {
            return null;
        }

        Matcher matcher = YOUTUBE_PATTERN.matcher(videoUrl);
        if (matcher.find()) {
            String videoId = matcher.group(1);
            return "https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg";
        }

        // If it's a Vimeo URL, typically we'd need to call their API.
        // For simplicity, we just return null if we can't extract it.
        return null;
    }
}
