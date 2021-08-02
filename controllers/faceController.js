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
    try {
        data = req.body.foto;
        inlabel = req.body.label;
        console.log(req.body.label);
        base64Data = data.replace(/^data:image\/png;base64,/, "");
        base64Data += base64Data.replace("+", " ");
        binaryData = new Buffer.from(base64Data, "base64").toString("binary");
        fs.writeFileSync(`photo_test/${inlabel}.jpeg`, binaryData, "binary");
        const imageBuffer = fs.readFileSync(`photo_test/${inlabel}.jpeg`);
        const result = await faceApiService.detect(imageBuffer, inlabel);
        // console.log(result);
        const response = {};
        if (result._distance > 0.3 && result._distance != 0) {
            response.success = false;
            response.msg = "Wajah tidak cocok";
            response.distance = result._distance;
            response.label = result._label;
        } else {
            if (result._label !== inlabel) {
                response.success = false;
                response.msg = "Wajah tidak cocok";
                response.distance = result._distance;
                response.label = result._label;
            } else {
                response.success = true;
                response.msg = "Wajah cocok";
                response.distance = result._distance;
                response.label = result._label;
            }
            result.success = true;
            result.label_dari_php = inlabel;
        //    result.img = imageBuffer;
        }
        // Hapus file
        //fs.close(imageBuffer);
        //fs.unlinkSync(`photo_test/${inlabel}.jpeg`);
        // Hapus label
        console.log(response);
        res.send(response);
    } catch (e) {
        console.log(e);
        response = {
            msg: "Terjadi kesalahan",
            success: false,
            info: e
        };
        console.log(response);
        res.send(response);
    }
};

exports.checkFaceExist = async (req, res, next) => {
    try {
    } catch (e) {
        console.log(e);
        response = {
            msg: "Terjadi kesalahan",
            success: false,
            info: e
        };
        res.send(response);

    }
};
