import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import axios from "axios";

const ObjectDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load the model once
  useEffect(() => {
    cocoSsd.load().then(setModel);
  }, []);

  // Render bounding boxes dan label di canvas
  const renderPredictions = (preds) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    preds.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = "rgba(255, 99, 132, 0.8)";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      ctx.font = "bold 18px Arial";
      ctx.fillStyle = "rgba(255, 99, 132, 0.8)";
      ctx.fillText(
        `${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`,
        x + 5,
        y > 20 ? y - 8 : y + 20
      );
    });
  };

  // Ambil snapshot webcam sebagai Blob (JPEG)
  // const getSnapshot = () => {
  //   const canvas = document.createElement("canvas");
  //   const video = webcamRef.current.video;
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   const ctx = canvas.getContext("2d");
  //   ctx.drawImage(video, 0, 0);
  //   return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));
  // };

  // Upload hasil deteksi ke backend
  const uploadDetection = async (prediction, imageBlob) => {
    const formData = new FormData();
    formData.append("label", prediction.class);
    formData.append("confidence", prediction.score);
    formData.append(
      "boundingBox",
      JSON.stringify({
        x: prediction.bbox[0],
        y: prediction.bbox[1],
        width: prediction.bbox[2],
        height: prediction.bbox[3],
      })
    );
    // formData.append("image", imageBlob, "snapshot.jpg");

    try {
      const url = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const res = await axios.post(url, formData);
      console.log("Upload success:", res.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Saat tombol ditekan: deteksi objek, render, snapshot, upload
  const handleTakePhoto = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      model
    ) {
      setIsProcessing(true);
      const video = webcamRef.current.video;
      const preds = await model.detect(video);
      setPredictions(preds);
      renderPredictions(preds);

      // const imageBlob = await getSnapshot();

      // Contoh: upload hanya prediksi pertama, bisa loop kalau mau semua
  //     if (preds.length > 0) {
  //       await uploadDetection(preds[0], imageBlob);
  //     }

  //     setIsProcessing(false);
  //   }
  // }, [model]);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
        Object Detection (Single Capture)
      </h1>

      <div className="relative w-[640px] h-[480px] rounded-xl overflow-hidden shadow-2xl border-4 border-pink-400">
        <Webcam
          ref={webcamRef}
          audio={false}
          className="absolute w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute w-full h-full pointer-events-none"
          width="640"
          height="480"
          style={{ background: "rgba(0,0,0,0.1)" }}
        />
        {predictions.map((pred, idx) => (
          <div
            key={idx}
            className="absolute px-2 py-1 bg-pink-500 bg-opacity-80 text-white text-xs rounded shadow-lg"
            style={{
              left: pred.bbox[0] + 5,
              top: pred.bbox[1] > 20 ? pred.bbox[1] - 28 : pred.bbox[1] + 20,
              pointerEvents: "none",
              zIndex: 10,
            }}>
            {pred.class}
          </div>
        ))}
      </div>

      <button
        onClick={handleTakePhoto}
        disabled={isProcessing}
        className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded shadow-lg disabled:opacity-50">
        {isProcessing ? "Processing..." : "Take Photo"}
      </button>

      <p className="mt-4 text-gray-300">Powered by TensorFlow.js & COCO-SSD</p>
    </div>
  );
};

export default ObjectDetection;
