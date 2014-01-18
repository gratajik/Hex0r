var HEX = '0123456789ABCDEF';
var BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function dec2_to_hex(dec) {
    if (dec < 0)
        dec = 0;
    
    if (dec > 255)
        dec = 255;

    return HEX.charAt(Math.floor(dec / 16)) + HEX.charAt(dec % 16);
}

function dec_to_hex8(dec) {
    var str = "";

    for (var i = 3; i >= 0; i--) {
        str += dec2_to_hex((dec >> (i * 8)) & 255);
    }

    return str;
}

function remove_whitespace(str) {
    return str.replace(/\n/g, "")
					  .replace(/\t/g, "")
					  .replace(/ /g, "")
					  .replace(/\r/g, "");
}

function base64_decode(encoded) {
    var decoded = "";

    for (var i = 0; i < encoded.length; i += 4) {
        var ch0 = encoded.charAt(i + 0);
        var ch1 = encoded.charAt(i + 1);
        var ch2 = encoded.charAt(i + 2);
        var ch3 = encoded.charAt(i + 3);

        var index0 = BASE64_CHARS.indexOf(ch0);
        var index1 = BASE64_CHARS.indexOf(ch1);
        var index2 = BASE64_CHARS.indexOf(ch2);
        var index3 = BASE64_CHARS.indexOf(ch3);

        decoded += String.fromCharCode((index0 << 2) | (index1 >> 4));
        decoded += String.fromCharCode(((index1 & 15) << 4) | (index2 >> 2));
        decoded += String.fromCharCode(((index2 & 3) << 6) | index3);
    }

    return decoded;
}

function markup_hex0rwindow(div) {
    var binData = base64_decode(remove_whitespace(div.text()));
    var lineData;
    var highlightsStr = $("form#hex0rwindow_params input[name='highlights']", div).attr("value").split(',');
    var highlights = [];

    for (var hi = 0; hi < highlightsStr.length; hi++) {
        highlights.push(highlightsStr[hi].split(":"));
    }

    var step = parseInt($("form#hex0rwindow_params input[name='row_width']", div).attr("value"));
    var wordSize = parseInt($("form#hex0rwindow_params input[name='word_size']", div).attr("value"));
    var rowBreak = parseInt($("form#hex0rwindow_params input[name='row_break']", div).attr("value"));
    var caption = $("form#hex0rwindow_params input[name='caption']", div).attr("value");

    div.text("");
    div.append("<table></table>");

    var offset = 0;

    function applyHighlights(index) {
        for (var idx = 0; idx < highlights.length; idx++) {
            if ((index >= highlights[idx][0]) && (index <= highlights[idx][1])) {
                if (index == highlights[idx][0]) {
                    $("table tr td:last", div).addClass("hex0rwindow_border_start");
                }

                if (index == highlights[idx][1]) {
                    $("table tr td:last", div).addClass("hex0rwindow_border_end");
                }

                $("table tr td:last", div).addClass("hex0rwindow_code_hi hex0rwindow_border_middle");
                $("table tr td:last", div).attr("style", "background-color: " + highlights[idx][2] + ";");
                $("table tr td:last", div).attr("title", highlights[idx][3]);

                runlen += 1;
            }
            else {
                $("table tr td:last", div).addClass("hex0rwindow_code");
            }
        }
    }

    if (caption)
        $("table", div).append("<caption>" + caption + "</caption>");

    while (binData.length > 0) {
        lineData = binData.slice(0, step);
        binData = binData.slice(step);

        $("table", div).addClass("hex0rwindow_table");
        $("table", div).append("<tr></tr>").addClass("hex0rwindow");
        
        $("table tr:last", div).append("<td>" + dec_to_hex8(offset) + " </td>");        
        $("table tr td:last", div).addClass("hex0rwindow_offset");

        var runlen = 0;

        for (var idxData = 0; idxData < lineData.length; idxData += wordSize) {
            var num = "";

            for (var idxWs = 0; idxWs < wordSize; idxWs++) {
                num += dec2_to_hex(lineData.charCodeAt(idxData + idxWs));
            }
            if (idxData == rowBreak - 1) {
                $("table tr:last", div).append("<td>" + num + "&nbsp;&nbsp;&nbsp</td>");

                applyHighlights(offset + idxData);

            }
            else {
                $("table tr:last", div).append("<td>" + num + " </td>");

                applyHighlights(offset + idxData);
            }
        }

        var text = "";

        for (var i = 0; i < lineData.length; i++) {
            var cc = lineData.charCodeAt(i);

            if ((cc >= 32) && (cc <= 126)) {
                text = text + lineData.charAt(i);
            }
            else {
                text = text + ".";
            }
        }

        if (lineData.length < step)
            $("table tr td:last", div).attr("colspan", Math.floor((step - lineData.length) / wordSize) + 1);

        offset += step;

        $("table tr:last", div).append("<td>" + text + "</td>");
        $("table tr td:last", div).addClass("hex0rwindow_visual");
    }
}

$(document).ready(function() {
    $("div.hex0rwindow").each(function(index) {
        markup_hex0rwindow($(this), index);
    });
});