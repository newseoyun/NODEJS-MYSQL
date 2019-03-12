var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123123',
    database : 'test1'
});
module.exports = db;

//버전관리에선 아이디비밀번호를 지우고 업로드하고, 지우지 않은 파일은 업로드하지 않고 별도로 관리한다.