exports.getLogin = (req, res, next) => {
    var response = {
        'msg': "Silahkan post untuk login",
        'success': true
    };
    res.send(response);
}

exports.postLogin = (req, res, next) => {
    var response = {
        'msg': "Silahkan get untuk login",
        'success': true
    };
    res.send(response);
}
