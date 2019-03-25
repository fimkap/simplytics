/**
 * Send analytics data.
 *
 * @param {dic} data POST request body
 * @param {string} mode Type of statistic
 */
function sendAnalytics(data, mode) {
    var client_id = getCookie("saCookie");
    data.clientid = `${client_id}`;
    $.post('http://35.230.142.130/analytics?mode='+mode, data, function() {
    });
}

/**
 * Create UUID
 *
 */
function createUUID() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    return s.join("");
}

/**
 * Create cookie with expiration
 *
 * @param {int} daysToExpire Number of days to expire
 */
function createCookie(daysToExpire)
{
    var date = new Date();
    date.setTime(date.getTime()+(daysToExpire*24*60*60*1000));
    document.cookie = "saCookie" + "=" + createUUID() + "; expires=" + date.toGMTString();
}

/**
 * Get cookie by name
 *
 * @param {string} name Name of cookie
 */
function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function(el) {
        let [k,v] = el.split('=');
        cookie[k.trim()] = v;
    })
    return cookie[name];
}

// If our cookie is not found, create one.
if (getCookie("saCookie") == undefined) {
    createCookie(5);
}
// Get query params.
var query_params = window.location.search;
// The smallest meaningful length
if (query_params.length > 3) {
    var data={
        query: query_params.substring(1)
    }
    sendAnalytics(data, "query");
}

// Send page view.
var data={
    path: `${location.pathname}`
}
sendAnalytics(data, "pageview");

// Store mouse moves here to send later in batches.
var moves = [];
document.addEventListener('mousemove', function (event) {
    moves.push(event.pageX+','+event.pageY);
}, false);

/**
 * Send mouse moves periodically.
 *
 */
function sendMoves() {
    if (moves.length > 0) {
        var movesToSend = moves.join(';');
        moves = []; // reset
        var data={
            moves: movesToSend
        }
        sendAnalytics(data, "moves");
    }
}
setInterval(sendMoves, 5000);

// Add listener for click events.
document.addEventListener('click', function (event) {
    var data={
        target: `${event.target}`
    }
    sendAnalytics(data, "click");
}, false);

// Add listener for textarea changes.
document.addEventListener('change', function (event) {
    var data={
        text: `${event.target.value}`
    }
    sendAnalytics(data, "text");
}, false);
