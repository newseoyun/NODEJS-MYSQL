var http = require('http'); 
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html'); //입력되는 태그 방지(소독).
var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123123',
    database : 'test1'
});

var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;  //url모듈의 parse펑션과 query컨스트럭터(생성자함수)
    var title = queryData.id;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){
        if(queryData.id === undefined) {
            db.query('SELECT * FROM topic', function (error, topics){
                console.log(topics);
                var title = "Hello WEB";
                var description = "Its Works!"
                var list = template.list(topics);
                var html = template.HTML(title, list, 
                    `<h2>${title}</h2>${description}`, 
                    `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            });

        } else {
            db.query('SELECT * FROM topic', function (error, topics){
                if(error){
                    throw error;
                };
                db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic){
                    if(error){
                        throw error;
                    };
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var html = template.HTML(title, list, 
                        `<h2>${title}</h2>${description}`, 
                        `<a href="/create">create</a>
                        <a href="/update?id=${queryData.id}">update</a>
                    <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <input type="submit" value="delete">
                    </form>`);
                    response.writeHead(200);
                    response.end(html); 
                });
            });
        }

    } else if(pathname === '/create') {
        db.query('SELECT * FROM topic', function (error, topics){
            var title = "Create";
            var list = template.list(topics);
            var html = template.HTML(title, list, 
                `<form action="http://localhost:3000/create_process" method="post">
                <p><input type="text" name="title" placeholder="File Title"></p>
                <p>
                <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>
            `, '');
            response.writeHead(200);
            response.end(html);
        });

    } else if(pathname === '/create_process') {
        var formBody = '';
        request.on('data', function(data){
            formBody = formBody + data;
        });
        request.on('end', function(){
            var post = qs.parse(formBody);
            var title = post.title;
            var description = post.description;
            db.query(`
            INSERT INTO topic (title, description, created, author_id) 
                VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, 1], 
            function(error, result){
                if(error){
                    throw error;
                };
                response.writeHead(302, {Location: `/?id=${result.insertId}`});
                response.end(); //302는 리다이렉션(이동) 시키라는 것.
            });
        });

    } else if(pathname === '/update'){
        fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.HTML(title, list,
              `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                <p>
                  <textarea name="description" placeholder="description">${description}</textarea>
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });

    } else if(pathname === '/update_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${filteredId}`, `data/${title}`, function(error){
              fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
              })
            });
        });

    } else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(error){
              response.writeHead(302, {Location: `/`});
              response.end();
            })
        });
    
    } else {
        response.writeHead(404);
        response.end('not found!');
    }

});
app.listen(3000);