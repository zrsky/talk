var formidable = require('formidable');
var db = require('../models/db.js');
var md5 = require('../models/md5.js');
var path = require('path');
var fs = require('fs');
var utils = require('../models/utils.js');
// console.log(md5)

exports.showIndex = function (req, res) {
    var username = req.session.username ? req.session.username : ''
    db.find('user', {username: username}, function(err, result) {
        if(err) {
            res.send(err);
            return;
        }

        var avatar = result[0] && result[0].avatar || 'default.jpg';

        res.render('index', {
            login: req.session.login,
            username: req.session.username,
            avatar: avatar
        }); 
    })
}

exports.showRegister = function (req, res) {
    res.render('register');
}

exports.doRegister = function (req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var username = fields.username;
        var password = md5(md5(fields.password) + '网易考拉');
        db.find('user', {
            username: username
        }, function (err, result) {
            if (err) {
                res.send('-3'); // 服务器端错误
                return
            }
            if (result.length != 0) {
                res.send('-1'); // 用户名被占用
                return
            }
            db.insertOne('user', {
                username: username,
                password: password,
                avatar: 'default.png'
            }, function (err, result) {
                if (err) {
                    res.send('-3'); //服务器端错误
                    return
                }
                req.session.login = 1;
                req.session.username = username;
                res.send('1')
            })
        })
    });
}

exports.showLogin = function (req, res) {
    res.render('Login');
}

exports.doLogin = function (req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var username = fields.username;
        var password = md5(md5(fields.password) + '网易考拉');
        db.find('user', {
            username: username
        }, function (err, result) {
            if (err) {
                res.send('-3'); // 服务器端错误
                return
            }
            if (result.length == 0) {
                res.send('-1'); // 没有查到此用户
                return
            } else if (password === result[0].password) {
                req.session.login = 1;
                req.session.username = username;
                res.send('1'); // 密码匹配
            } else if (password !== result[0].password) {
                res.send('-2');  //密码不匹配
            }
        })
    });
}

// 注销
exports.unLogin = function(req, res) {
    req.session.username = '';
    req.session.login = 0;
    res.send('1');
}

// 修改头像页面
exports.showSetAvatar = function(req, res) {
    res.render('setAvatar')
}

// 修改头像
exports.doSetAvatar = function(req, res) {
    console.log('doSetAvatar')
    var form = new formidable.IncomingForm();

    form.uploadDir = path.normalize(__dirname + '/../avatar');

    form.parse(req, function(err, fields, files) {
      console.log(files)
      var fileName = files.image.name;
      var index = fileName.indexOf('.');
      var prefix = fileName.substring(index);
      var oldpath = files.image.path;
      var random = utils.getId(req.session.username) + prefix;
      var newpath = path.normalize(__dirname + '/../avatar/' + random);
      fs.rename(oldpath, newpath, function(err, result) {
          if(err) {
              throw new Error(err);
          }
          db.find('user', {username: req.session.username}, function(err, result) {
              if(err) {
                  throw new Error(err);
              }
              db.updateMany('user',{username: req.session.username},{$set: {avatar: random}}, function(err, data) {
                if(err) {
                    res.send('修改失败');
                    return;
                }
                
                var filePath = __dirname + '/../avatar/' + result[0].avatar;
                fs.unlink(filePath, (err) => {
                    if (err) throw err;
                    console.log('文件已删除');
                  });
                res.redirect('/');
            });
          })
          
      })
    });

}