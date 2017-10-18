const urlRoot = '/blog2';

function getQueryParams(url) {
    return url
        .slice(url.indexOf('?') + 1)
        .split('&')
        .map(param => param.split('='))
        .reduce((prev, curr) => {
            prev[curr[0]] = decodeURIComponent(curr[1]);

            return prev;
        }, {});
}

function createHTML(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    };
    return frag;
};

function parseMarkdown(markdown) {
    const converter = new showdown.Converter();
    return converter.makeHtml(markdown);
};

function retrievePage(page) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest(),
            method = 'GET',
            url = urlRoot + '/content/' + page + '.md';
        req.open(method, url, true);
        req.overrideMimeType('text/markdown');
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status != 200) {
                    reject('Failed to retrieve post ' + page + ', returned ' + req.status);
                };

                resolve(parseMarkdown(req.responseText));
            };
        };
        req.send();
    });
};

function retrieveIndex() {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest(),
              method = 'GET',
              url = urlRoot + '/index';
        req.open(method, url, true);
        req.overrideMimeType('application/json');
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                var list = req.responseText.split('\n').reverse(),
                    requests = list.map(a => retrievePage(a));
                Promise.all(requests).then(resolvedPromises => {
                    resolve(resolvedPromises);
                }).catch(reason => {
                    reject(reason);
                });
            };
        };
        req.send();
    });
};

function insertPost(html) {
    document.body.insertBefore(createHTML(html), document.body.childNodes[0]);
};

function blargh() {
    const params = getQueryParams(document.location.search),
          page = params.page || "index";
    const pageLoad = new Promise((resolve, reject) => {
        if (page == 'index') {
            retrieveIndex().then(resolvedPromises => {
                resolvedPromises.map(insertPost);
            }).catch(reason => {
                reject(reason);
            });
        } else {
            retrievePage(page).then(result => {
                insertPost(result);
            }).catch(reason => {
                reject(reason);
            });
        };
    });
    pageLoad.catch(reason => {
        console.log(reason);
    });
};
