var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./module/template.js');
var path = require('path');
var app = http.createServer(function (request, response) {
  console.log('New Request');
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    var filteredId = '';
    if (queryData.id != undefined) {
        filteredId = path.parse(queryData.id).base;
    } else {
        filteredId = undefined;
    }
    if (pathname === '/') {
        if (filteredId == undefined || filteredId == 'Welcome') {
            fs.readdir('./data', function (error, filelist) {
                var title = 'Welcome';
                var description = fs.readFileSync('./data/Welcome', 'utf8');
                var __list = template.list(filelist);
                var __template = template.html(title, __list,
                    `<h2>${title}</h2>${description}`,
                    `<input type="button" value="create" onclick="
                        window.location.href = '/create';
                    ">`
                );
                response.writeHead(200);
                response.end(__template);
            });
        } else {
            fs.readdir('./data', function (error, filelist) {
                fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                    var title = filteredId;
                    var __list = template.list(filelist);
                    var __template = template.html(title, __list,
                        `<h2>${title}</h2>${description}`,
                        `<input type = "button" value = "create" onclick = "
                        window.location.href = '/create';
                        ">
                        <input type = "button" value = "update" onclick = "
                        window.location.href = '/update?id=${title}';
                        ">
                        <form style="
                            display: inline;
                        " action="/delete_process" method="POST" onsubmit="
                        if (confirm('Delete ${title}?')) {
                            return true;
                        } else {
                            return false
                        }
                        ">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="delete">
                        </form>
                        `
                    );
                    response.end(__template);
                });
                response.writeHead(200);
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function (error, filelist) {
            var title = 'WEB - create';
            var __list = template.list(filelist);
            var __template = template.html(title, __list, `
          <form action="/create_process" method="post" onsubmit="
                if(yes){
                    return true;
                } else {
                    return false;
                }
          ">
            <p>All the HTML tags won't work in this document.</p>
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <div id="html_element"></div>
            </p>
            <p>
                <input type="submit">
            </p>
          </form>
        `, '');
            response.writeHead(200);
            response.end(__template);
        });
    } else if (pathname === '/create_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            var __description = description.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, "&apos;");
            fs.writeFile(`data/${title}`, __description, 'utf8', function (err) {
                response.writeHead(302, {
                  'Location': `/?id=${title}`
                });
                response.end();
            });
        });
    } else if (pathname === '/update') {
        fs.readdir('./data', function (error, filelist) {
            fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
                var title = filteredId;
                var __list = template.list(filelist);
                var __template = template.html(title, __list,
                    `
            <form action="/update_process" method="post" onsubmit="
                if(yes){
                    return true;
                } else {
                    return false;
                }
              ">
              <p>All the HTML tags won't work in this document.</p>
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <div id="html_element"></div>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `, '');
                response.writeHead(200);
                response.end(__template);
            });
        });
    } else if (pathname == '/update_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            var __description = description.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, "&apos;");
            fs.rename(`./data/${id}`, `./data/${title}`, function (err) {
                fs.writeFile(`./data/${title}`, __description, function (err) {
                    response.writeHead(302, {
                    'Location': '/?id=' + title
                    });
                    response.end();
                });
            });
        });
    } else if (pathname == '/delete_process') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function () {
            var post = qs.parse(body);
            var id = post.id;
            var filterdId = path.parse(id).base;
            fs.unlink(`./data/${filterdId}`, function (err) {
                response.writeHead(302, { 'Location': `/` });
                response.end();
            });
        });
    } else if (pathname == '/style.css') {
        fs.readFile('./style.css', 'utf8', function (err, data) {
            if (err) {
                response.writeHead(404);
                response.end('404 Not found');
            } else {
                response.writeHead(200);
                response.end(data);
            }
        });
    } else if (pathname == '/coding.jpg') {
        fs.readFile('./coding.jpg', function (err, data) {
            if (err) {
                response.writeHead(404);
                response.end('404 Not Found')
            } else {
                response.writeHead(200, { 'Content-Type': 'image/jpeg' });
                response.end(data);
            }
        });
    } else {
        response.writeHead(404);
        response.end('<h1>404 Not found</h1><a href="/">Home</a>');
    }
});
app.listen(1337);
