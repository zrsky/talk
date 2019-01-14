var MongoClient = require('mongodb').MongoClient;
var settings = require('../settings.js');

function _connectDB(callback) {
    var url = settings.dbURL;
    MongoClient.connect(url, function(err, db) {
        const talk = db.db('talk');
        callback(err, talk, db);
    })
}

// 插入数据

exports.insertOne = function (collectionName, json, callback) {
    _connectDB(function (err, talk, db) {
        if(err) {
            callback(err, null);
            return
        }
        talk.collection(collectionName).insertOne(json, function (err, result) {
            if(err) { 
                callback(err, null);
            }
            callback(null, result);
            db.close(); //关闭数据库
        })
    })
};


//查找数据

exports.find = function(collectionName, json, C, D) {
    let result = [];
    let length = arguments.length;
    let callback, args, limitNumber, skipNumber, sort;
    if(length === 3) {
        callback = C;
        limitNumber = 0;
        skipNumber = 0;
        sort = {};
    }else if(length === 4) {
        args = C;
        callback = D;
        limitNumber = args.pageSize || 0;
        skipNumber = args.pageSize * (args.pageNo - 1) || 0;
        sort = args.sort;
    }
    _connectDB(function(err,talk, db) {
        if(err) {
            callback(err, null);
            return;
        }
       var cursor = talk.collection(collectionName).find(json).limit(limitNumber).skip(skipNumber).sort(sort);
       cursor.each(function(err, doc) {
           if(doc != null) {
               result.push(doc)
           } else {
               callback(null, result);
               db.close(); //关闭数据库
           }
       })
    })

}

//删除
exports.deleteMany = function(collectionName, json, callback) {
    _connectDB(function(err, talk, db) {
        if(err) {
            callback(err, null);
            return
        }

        talk.collection(collectionName).deleteMany(json, function(err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(null, result);
            db.close();
        })
    })
}


//更改
exports.updateMany = function(collectionName, json1, json2, callback) {
    _connectDB(function(err, talk, db) {
        if(err) {
            callback(err, null);
            return;
        }

        talk.collection(collectionName).updateMany(json1, json2, function(err, result) {
            if(err) {
                callback(err, null);
                return;
            }
            callback(null, result);
            db.close();
        })
    })
}

init();

function init() {
    _connectDB(function(err, talk, db) {
        talk.collection('user').createIndex({'username': 1}, null, function(err, result) {
            console.log(result);
        })
    })
}

//得到总数量
exports.getAllCount = function (collectionName,callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).count({}).then(function(count) {
            callback(null, count);
            db.close();
        });
    })
}