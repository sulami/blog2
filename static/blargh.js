function getQueryParams(qs) {
    qs = qs.split('+').join(' ');
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
    while ((tokens = re.exec(qs))) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    };
    return params;
};

function createHTML(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    };
    return frag;
};

function retrievePage(page) {
    var req = new XMLHttpRequest(),
        method = 'GET',
        url = '/blog2/' + page + '.md';
    req.open(method, url, true);
    req.overrideMimeType('text/markdown');
    req.onreadystatechange = function () {
        if (req.readyState != 4) {
            return;
        };

        var converter = new showdown.Converter(),
            html = converter.makeHtml(req.responseText);

        if (req.status != 200) {
            html = "<p>I am error<p>";
        };

        document.body.insertBefore(createHTML(html), document.body.childNodes[0]);
    };
    req.send();
};

function blargh() {
    var params = getQueryParams(document.location.search),
        page   = params.page || "home";
    retrievePage(page);
};
