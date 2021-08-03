const path = require("path");
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
// const { Canvas } = require("canvas");
const canvas = require("canvas");
const modelPathRoot = "../face/models";
const weightPathRoot = "../face/weights";
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
var s3 = new AWS.S3();



let optionsSSDMobileNet;

async function image(file) {
    const decoded = tf.node.decodeImage(file, 3);
    const casted = decoded.toFloat();
    const result = casted.expandDims(0);
    decoded.dispose();
    casted.dispose();
    //console.log(result);
    return result;
}

async function detect(tensor) {
    const result = await faceapi
        .detectAllFaces(tensor, optionsSSDMobileNet)
        .withFaceLandmarks()
        .withFaceDescriptors();

    if (!result.length) {
        return {
            msg: "No face detected",
            success: false,
        };
    }

    const faceMatcher = new faceapi.FaceMatcher(result);

    const singleResult = await faceapi
        .detectSingleFace(tensor, optionsSSDMobileNet)
        .withFaceLandmarks()
        .withFaceDescriptor();

    // return result; // untuk semua result
    return singleResult; // untuk single result
}

async function main(file, inlabel) {
    console.log("FaceAPI single-process test");

    await faceapi.tf.setBackend("tensorflow");
    await faceapi.tf.enableProdMode();
    await faceapi.tf.ENV.set("DEBUG", false);
    await faceapi.tf.ready();

    console.log(
        `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${
            faceapi.version.faceapi
        } Backend: ${faceapi.tf?.getBackend()}`
    );

    console.log("Loading FaceAPI models");
    console.log(file);
    const modelPath = path.join(__dirname, modelPathRoot);
    const weightPath = path.join(__dirname, weightPathRoot);

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);

    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.1,
    });

    const tensor = await image(file);
    const detections = await detect(tensor);
    const labeledFaceDescriptors = await loadLabeledImages(inlabel);

    console.log("Detected faces:", detections.length);

    tensor.dispose();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
    console.log(detections.length);
    // const result = detections;

    const result = faceMatcher.findBestMatch(detections.descriptor);

    return result;
}

//async function loadLabeledImages() {
async function loadLabeledImages(inlabel) {
    // Mulai pakai s3
    const awsPath = `mahasiswa/dataset/${inlabel}/`;
    var params = {
        Bucket: 'gmedia',
        Delimiter: '',
        Prefix: awsPath
    }
    const descriptions = [];

    var listObject = await s3.listObjects(params).promise();
    const keys = [];
    for(var i = 0; i < listObject.Contents.length ; i++) {
        item = listObject.Contents[i];
        try {
            var params = {
                Bucket: 'gmedia',
                Key: item.Key
                //Expires: 60*1
            };
            const data = await s3.getObject(params).promise();;
            const file = data.Body;
            const img = await image(file);
            console.log(img);
            const detections = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();
            descriptions.push(detections.descriptor);
        } catch (e) {
            console.log(e);
        }
    }

    output = new faceapi.LabeledFaceDescriptors(inlabel, descriptions);
    //console.log(keys);

    // Selesai pakai s3

    // Mulai pakai file

    //const descriptions = [];

    //const directoryPath = `./photos/mahasiswa/dataset/${inlabel}/`;
    //const allFiles = fs.readdirSync(directoryPath);
    //for (var i = 0; i < allFiles.length ; i++) {
    //    try {
    //        const file = await fs.readFileSync(`${directoryPath}/${allFiles[i]}`);
    //        const img = await image(file);
    //        const detections = await faceapi
    //            .detectSingleFace(img)
    //            .withFaceLandmarks()
    //            .withFaceDescriptor();

    //        descriptions.push(detections.descriptor);
    //    } catch (e) {
    //        console.log(e);
    //    }
    //};
    //output = new faceapi.LabeledFaceDescriptors(inlabel, descriptions);
    // Selesai pakai file

    return output;
}

// async function check if loaded images exist face
async function checkLabeledImages(inlabel) {
    const directoryPath = `./photos/mahasiswa/dataset/${inlabel}/`;

    const allFiles = fs.readdirSync(directoryPath);
    console.log(allFiles);
    const descriptions = [];
    var total = 0;
    for (var i = 0; i < allFiles.length ; i++) {
        try {
            // Ambil semua file dari s3 untuk di train
            const file = await fs.readFileSync(`${directoryPath}/${allFiles[i]}`);

            // Jika file sudah di get masukkan ke dalam detections
            const img = await image(file);
            const detections = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (typeof(detections.descriptor) == 'undefined') {
                total = total + 1;
            } else {
                descriptions.push(detections.descriptor);
            }
        } catch (e) {
            console.log(e);
        }
    };
    output = new faceapi.LabeledFaceDescriptors(inlabel, descriptions);
    return total;
}

module.exports = {
    detect: main, // memetakan fungsi main ke detect untuk dipanggil keluar
};
