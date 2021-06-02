var dotenv = require('dotenv');
var jwt = require('jsonwebtoken');

function generateAccessToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)

        if (err) return res.sendStatus(403)

        req.user = user

        next()
    })
}

exports.getRegister = (req, res, next) => {
    response = {
        'msg': "Silahkan POST untuk register",
        'success': true
    };
    res.send(response);
}

exports.postRegister = (req, res, next) => {
    const token = generateAccessToken({ 
        username: req.body.username, 
        password: req.body.password
    });

    response = {
        'username': req.body.username,
        'token': token
    };
    res.send(response);

}
