var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
const { exec } = require("child_process");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//generacion de los archivos de relleno
if(!fs.existsSync("./files/junk100mb.dat"))
{
    
    exec("dd if=/dev/zero of=./files/junk100mb.dat  bs=100M  count=1")

}
if(!fs.existsSync("./files/junk250mb.dat"))
{
    exec("dd if=/dev/zero of=./files/junk250mb.dat  bs=250M  count=1")
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
