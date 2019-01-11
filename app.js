const express = require('express');

const app = express();

const router = require('./router/router.js');

const session = require('express-session');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.static('./avatar'));

app.get('/', router.showIndex);

app.get('/register', router.showRegister);

app.post('/doregister', router.doRegister);

app.get('/login', router.showLogin);

app.post('/dologin', router.doLogin);

app.post('/unlogin', router.unLogin);

app.get('/setAvatar', router.showSetAvatar);

app.post('/doSetAvatar', router.doSetAvatar);

app.post('/dopost', router.doPost);

app.get('/getAllMessage', router.getAllMesage);

app.listen('3000');
