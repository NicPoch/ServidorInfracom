var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
const { exec } = require("child_process");
var os = require('os');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// check for os and junk file generation
if(process.platform==="win32")
{
    if(!fs.existsSync("./files/junk100mb.dat"))
    {
        
        exec("fsutil file createnew ./files/junk100mb.dat 104857600")   //fsutil win size in bytes

    }
    if(!fs.existsSync("./files/junk250mb.dat"))
    {
        exec("fsutil file createnew ./files/junk250mb.dat 262144000")
    }
}
else
{
    if(!fs.existsSync("./files/junk100mb.dat"))
    {
        exec("dd if=/dev/zero of=./files/junk100mb.dat  bs=100M  count=1")  //fsutil unix size in Mb
    }
    if(!fs.existsSync("./files/junk250mb.dat"))
    {
        exec("dd if=/dev/zero of=./files/junk250mb.dat  bs=250M  count=1")
    }
}


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
