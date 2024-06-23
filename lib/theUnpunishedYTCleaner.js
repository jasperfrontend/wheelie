// originally written by The_Unpunished. Thank you.
const baseLink = "https://www.youtube.com/watch?v=";
const youtuBe = "https://youtu.be";
const youtubeCom = "https://www.youtube.com";
const youtubeComNoW = "https://youtube.com";
const emptyString = "";
const http = "http://";
const https = "https://";
const ampersand = '&';
const questionMark = '?';
const watchKey = "v=";

function execute(beforeFilter) {
    let afterFilter = makeHttps(beforeFilter);
    let queryType = determineQueryType(afterFilter);
    if (queryType === "YOUTUBE_DOT_COM_NO_W") {
        afterFilter = addWww(afterFilter);
        queryType = "YOUTUBE_DOT_COM";
    }
    afterFilter = filterQuery(afterFilter, queryType);
    const hasFuckedUpLink = (afterFilter === emptyString);
    return {
        requestHasFuckedUpLink: hasFuckedUpLink,
        filteredYouTubeLink: afterFilter
    };
}

function makeHttps(query) {
    if (!query.toLowerCase().startsWith(https) && query.toLowerCase().startsWith(http)) {
        return https + query.substring(http.length);
    }
    return query;
}

function determineQueryType(httpsLink) {
    if (httpsLink.toLowerCase().startsWith(youtuBe.toLowerCase())) {
        return "YOUTU_DOT_BE";
    }
    if (httpsLink.toLowerCase().startsWith(youtubeCom.toLowerCase())) {
        return "YOUTUBE_DOT_COM";
    }
    if (httpsLink.toLowerCase().startsWith(youtubeComNoW.toLowerCase())) {
        return "YOUTUBE_DOT_COM_NO_W";
    }
    return "SEARCH_REQUEST";
}

function addWww(httpsLink) {
    return https + "www" + httpsLink.substring(https.length);
}

function filterQuery(query, queryType) {
    let result = emptyString;
    let watchValue = emptyString;
    watchValue = parseWatchValue(query, queryType);
    if (queryType !== "SEARCH_REQUEST") {
        if (watchValue !== emptyString) {
            result = watchValue; // just return the video ID to send to the YouTube API
        }
    } else {
        result = null; // straight up deny any requests that are not YouTube links
    }
    return result;
}

function parseWatchValue(ytLink, queryType) {
    let parameterString = emptyString;
    let ytBase = "";
    switch (queryType) {
        case "YOUTU_DOT_BE":
            ytBase = youtuBe;
            break;
        case "YOUTUBE_DOT_COM":
            ytBase = youtubeCom;
            break;
        default:
            return emptyString;
    }
    if (ytBase.length >= ytLink.length) {
        return emptyString;
    }
    parameterString = ytLink.substring(ytBase.length);
    if (parameterString.length <= 1) {
        return emptyString;
    }
    switch (queryType) {
        case "YOUTU_DOT_BE":
            if (parameterString[1] === questionMark) {
                return emptyString;
            }
            if (parameterString.includes(questionMark)) {
                return parameterString.substring(1, parameterString.indexOf(questionMark));
            } else {
                return parameterString.substring(1);
            }
        case "YOUTUBE_DOT_COM":
            if (!parameterString.includes(watchKey)) {
                return emptyString;
            }
            parameterString = parameterString.substring(parameterString.indexOf(watchKey) + watchKey.length);
            if (parameterString.includes(ampersand)) {
                return parameterString.substring(0, parameterString.indexOf(ampersand));
            } else {
                return parameterString;
            }
    }
    return emptyString;
}

module.exports = {
    execute
};
