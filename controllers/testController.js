const https = require('https');

var AWS = require('aws-sdk');
AWS.NodeHttpClient.sslAgent = new https.Agent({ rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0' });

AWS.config.update({
    accessKeyId: 'root',
    secretAccessKey: 'aselole00',
    region: 'eu-east-1',
    endpoint: 's3.smartmanagement.id',
    setEnabled: false,
    s3ForcePathStyle: true
 //   sslEnabled: false,
 //   rejectUnauthorized: false
});

//AWS.config.update({accessKeyId: '43851a89a6fdf9eebd8d',
//    secretAccessKey: 'kMsg9Ct2QPbDzMtdWckDQXD/toCnlT1tX7V/45Gq',
//    region: 'eu-east-1',
//    endpoint: 's3.pelindo.co.id',
//    setEnabled: false,
//    s3ForcePathStyle: true,
//    sslEnabled: false,
//    rejectUnauthorized: false
//});

var s3 = new AWS.S3();

//var params = { 
//      Bucket: 'agus',
//      Delimiter: '',
//      Prefix: '' 
//}

var params = {
    Bucket: 'gmedia',
    Delimiter: '',
    Prefix: 'mahasiswa/dataset'
}

exports.getTest = (req, res, next) => {
    console.log("Data masuk");
    s3.listObjects(params, function (err, data) {
        console.log("s3 init");
        if(err)throw err;
        console.log("menunggu list...");
        console.log(data);
        res.send(data);
    });


    var response = {
        'msg': "Silahkan post untuk login",
        'success': true
    };
    //res.send(data);
}
