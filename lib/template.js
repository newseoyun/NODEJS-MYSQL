module.exports = {
    HTML : function(title, list, body, control){
        return `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <title>${title}</title>
        </head>
        
        <body>
        <h1><a href="/">WEB</a></h1>
        <h3>${list}</h3>
        ${control}
        ${body}
        </body>
        </html>
        `;
    }, list : function(topics){           
        var i = 0;
        var list = `<ul>`;
        while (i < topics.length){
            list = list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
            i = i + 1;
        }
        list = list + `</ul>`;
        return list;
    }, authorSelect : function(authors, author_id){
        var tag = '';
        var i = 0;
        while (i < authors.length){
            var selected = '';
            if (author_id == authors[i].id){
                selected = ` selected`;
            }
            tag += `<option value=${authors[i].id}${selected}>${authors[i].name}</option>`;
            i++;
        }
        return `
        <select name="author">${tag}</select>
        `;
    }
}