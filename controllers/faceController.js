var dotenv = require("dotenv");
var fs = require("fs");
var jwt = require("jsonwebtoken");
var tf = require("@tensorflow/tfjs-node");
tf.setBackend('cpu');
var faceapi = require("@vladmandic/face-api");
var canvas = require("canvas");
var faceApiService = require("./faceapiService");
var http = require("http");

exports.getFace = (req, res, next) => {
    response = {
        msg: "Silahkan POST untuk mendaftarkan muka",
        success: true,
    };
    res.send(response);
};

exports.postFace = (req, res, next) => {
    data = req.body.face;
    base64Data = data.replace(/^data:image\/png;base64,/, "");
    base64Data += base64Data.replace("+", " ");
    binaryData = new Buffer(base64Data, "base64").toString("binary");
    dir = `./photos/${req.body.uuid}`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const length = fs.readdirSync(dir).length;
    const filename = length + 1;
    console.log(filename);
    fs.writeFile(
        `photos/${req.body.uuid}/${filename}.png`,
        binaryData,
        "binary",
        function (err) {
            if (err != null) {
                console.log(err); // writes out file without error, but it's not a valid image
            } else {
                console.log("Berhasil masuk");
            }
        }
    );

    response = {
        msg: "Berhasil input gambar",
        success: true,
    };

    res.send(response);
};

exports.checkFace = async (req, res, next) => {
    // 1 Cek jumlah foto di folder s3 dengan label uuid mahasiswa
    // Download
    data = req.body.foto;
    base64Data = data.replace(/^data:image\/png;base64,/, "");
    base64Data += base64Data.replace("+", " ");
    binaryData = new Buffer.from(base64Data, "base64").toString("binary");
    fs.writeFileSync(`photo_test/test.jpeg`, binaryData, "binary");
    const imageBuffer = fs.readFileSync("photo_test/test.jpeg");
    const result = await faceApiService.detect(imageBuffer);
    // console.log(result);
    res.json(result);
};
