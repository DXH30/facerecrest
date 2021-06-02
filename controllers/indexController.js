exports.welcome = (req, res, next) => {
    var test = {
        'msg': "Bisa hidup",
        'success': true
    };
    res.send(test);
};
