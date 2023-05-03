//*** Syntax 'parser' code ***//

var quotedTermRe = new RegExp('([\"\'])(?:(?=(\\\\?))\\2.)*?\\1', 'gi');
var termRe = new RegExp('(\\\/div>([A-Z].{1,}?)<div)|(\\\/div>( +[A-Z].{1,}?)<div)', 'gi');
var termStrayRe = new RegExp('(\\/div>([0-9]{1,}?)\\w+<div)', 'gi');
var termStrayExtraRe = new RegExp('(\\/div>([0-9]{1,}?)(.{1,}?)<div)', 'gi');
var termStrayNumberRe = new RegExp('(\\/div>([0-9]{1,}?)<div)', 'gi');
var termStraySpaceNumberRe = new RegExp('(\\/div>[ ]([0-9]{1,}?)<div)', 'gi');
var termStraySpaceNumberSpaceRe = new RegExp('(\\/div>[ ]([0-9]{1,}?)[ ]<div)', 'gi');
var termStrayNumberSpaceRe = new RegExp('(\\/div>([0-9]{1,}?)[ ]<div)', 'gi');
var andRe = new RegExp('( AND | and )', 'gi');
var orRe = new RegExp('( OR | or )', 'gi');
var notRe = new RegExp('( NOT | not )', 'gi');
var nearOpRe = new RegExp('(( \\w+[A-Za-z][\/][0-9]+)|( [A-Za-z][\/][0-9]+))', 'gi');
var embaseRe = new RegExp('(([\/][A-Za-z])\\w+|([\:][A-Za-z])\\w+|([,][A-Za-z])\\w+|([.][A-Za-z])\\w+)', 'gi');
var pubmedRe = new RegExp('([ ][w|n][0-9]+)', 'gi');
var embasePhrase = ":";
var embaseExact = "/";
var specialColon = "isfgsvkhADSFVMQEREGQ";
var specialSlash = "n7k8nkumhngbwSAVRUTY";
var special = "___";

function nearOpFunction(x) {
    x = "<div class=near>" + x + " " + "</div>";
    x = x.replace(new RegExp('/', 'gi'), specialSlash);
    return x;
}

function embaseFunction(x) {
    x = "<div class=embase>" + x + "</div>";
    return x;
}

function pubmedFunction(x) {
    x = "<div class=pubmed>" + x + "</div>";
    return x;
}

function booleanAndFunction(x) {
    x = "<div class=\"boolean and\">" + x + "</div>";
    return x;
}

function booleanOrFunction(x) {
    x = "<div class=\"boolean or\">" + x + "</div>";
    return x;
}

function booleanNotFunction(x) {
    x = "<div class=\"boolean not\">" + x + "</div>";
    return x;
}

function quotedTermToElement(x) {
    x = x.replace(new RegExp(' ', 'gi'), special);
    x = "<div class=quote-term>" + x + "</div>";
    x = x.replace(new RegExp('/', 'gi'), specialSlash);
    x = x.replace(new RegExp(':', 'gi'), specialColon);
    return x;
}

function termReFunction(x) {
    x = x.replace("<div", "</div><div");
    x = x.replace("/div>", "/div><div class=\"term\">");
    return x;
}

function syntaxParser(str) {
    time = Date.now();

    str = str.replace(quotedTermRe, function (x) { return quotedTermToElement(x); });
    str = str.replace(embaseRe, function (x) { return embaseFunction(x); });
    str = str.replace(nearOpRe, function (x) { return nearOpFunction(x); });
    // str = str.replace(pubmedRe, function (x) { return pubmedFunction(x); }); //TODO bestaat dit nog in PubMed? Of is alles met ~ tussen de [] 
    str = str.replace(andRe, function (x) { return booleanAndFunction(x); });
    str = str.replace(orRe, function (x) { return booleanOrFunction(x); });
    str = str.replace(notRe, function (x) { return booleanNotFunction(x); });

    // brackets
    str = str.replaceAll("(", "<div class=\"brackets\"><div class=\"bracket-open\">(</div>");
    str = str.replaceAll(")", "<div class=\"bracket-close\">)</div></div>");

    // square brackets
    str = str.replaceAll("[", "<div class=\"square-brackets\">[");
    str = str.replaceAll("]", "]</div>");

    str = str.replace(new RegExp(specialSlash, 'gi'), '/'); //un-special-fy
    str = str.replace(new RegExp(specialColon, 'gi'), ':'); //un-special-fy
    str = str.replace(new RegExp(special, 'gi'), ' '); //un-special-fy
    str = str.replace('class=embase', 'class=\"embase\"'); //un-special-fy embase
    str = str.replace('</div>.', '</div><div class="embase">.</div>'); //embas "." cleanup
    str = str.replace('class=quote-term', 'class=\"quote-term\"'); //un-special-fy quote

    // make stray words elements
    str = "<div id=\"search-string\" class=\"search-string\"><div class=\"dummy\"></div>" + str + "<div class=\"dummy\"></div></div>"
    strOld = "";
    while (str != strOld) {
        strOld = str;
        str = str.replace(termRe, function (x) { return termReFunction(x); }); //make stray words elements
        str = str.replace(termStrayRe, function (x) { return termReFunction(x); }); //make stray words elements
        str = str.replace(termStrayExtraRe, function (x) { return termReFunction(x); }); //make stray words elements
        str = str.replace(termStrayNumberRe, function (x) { return termReFunction(x); }); //make stray words elements
        str = str.replace(termStraySpaceNumberRe, function (x) { return termReFunction(x); }); //make stray words elements
        str = str.replace(termStraySpaceNumberSpaceRe, function (x) { return termReFunction(x); }); //make stray words elements
        str = str.replace(termStrayNumberSpaceRe, function (x) { return termReFunction(x); }); //make stray words elements
    }

    console.log('duration: ' + (Date.now() - time) + 'ms');
    return str;
}

onmessage = (e) => {
    //TODO timeout van 20ms? Voor betere invoer experience
    console.log("Message received from main script");
    const workerResult = syntaxParser(e.data);
    console.log("Posting message back to main script");
    postMessage(workerResult);
};