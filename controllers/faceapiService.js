const path = require("path");
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
// const { Canvas } = require("canvas");
const canvas = require("canvas");
const modelPathRoot = "../face/models";
const weightPathRoot = "../face/weights";

let optionsSSDMobileNet;

async function image(file) {
    const decoded = tf.node.decodeImage(file, 3);
    const casted = decoded.toFloat();
    const result = casted.expandDims(0);
    decoded.dispose();
    casted.dispose();
    console.log(result);
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
    //// Upload ke s3 dari input
    //const comparatorPath = "./photos/mahasiswa/dataset";
    ////const comparatorPath = "./dataset1";
    //const labels = fs.readdirSync(comparatorPath);
    //const output = 
    //    Promise.all(
    //        labels.map(async (label) => {
    //            const allFiles = fs.readdirSync(`${comparatorPath}/${label}/`);
    //            const descriptions = [];
    //            allFiles.forEach(async(i) => {
    //                //try {
    //                    // Ambil semua file dari s3 untuk di train
    //                    const file = await fs.readFileSync(`${comparatorPath}/${label}/${i}`);

    //                    // Jika file sudah di get masukkan ke dalam detections
    //                    const img = await image(file);

    //                    const detections = await faceapi
    //                        .detectSingleFace(img)
    //                        .withFaceLandmarks()
    //                        .withFaceDescriptor();

    //                    console.log(detections);

    //                    descriptions.push(detections.descriptor);
    //                //} catch (e) {
    //                //    console.log(`File ${label}/${i}`);
    //                //    console.log(e);
    //                //}
    //            });
    //            // Setiap data foto masuk, ini harus dipanggil
    //            return new faceapi.LabeledFaceDescriptors(label, descriptions);
    //        })
    //    );

    const directoryPath = `./photos/mahasiswa/dataset/${inlabel}/`;

    const allFiles = fs.readdirSync(directoryPath);
    console.log(allFiles);
    const descriptions = [];
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

        descriptions.push(detections.descriptor);
        } catch (e) {
            console.log(e);
        }
    };
    output = new faceapi.LabeledFaceDescriptors(inlabel, descriptions);

    //const directoryPath = "./photos/mahasiswa/dataset";
    //const labels = fs.readdirSync(directoryPath);
    //const output = Promise.all(
    //    labels.map(async (label) => {
    //        const allFiles = fs.readdirSync(`./photos/mahasiswa/dataset/${label}/`);
    //        const descriptions = [];
    //        allFiles.map(async(i) => {
    //            const file = await fs.readFileSync(`./photos/mahasiswa/dataset/${label}/${i}`);
    //            const img = await image(file);
    //            try {
    //                const detections = await faceapi
    //                    .detectSingleFace(img)
    //                    .withFaceLandmarks()
    //                    .withFaceDescriptor();
    //                descriptions.push(detections.descriptor);
    //            } catch (e) {
    //                console.log(e);
    //            }
    //        });
    //        return new faceapi.LabeledFaceDescriptors(label, descriptions);
    //    })
    //);

    return output;
}

module.exports = {
    detect: main,
};
