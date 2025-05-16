import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const ObjectDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);

  const loadModel = useCallback(async () => {
    const loadedModel = await cocoSsd.load();
    setModel(loadedModel);
  }, []);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  const detectObjects = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      model
    ) {
      const video = webcamRef.current.video;
      const preds = await model.detect(video);
      setPredictions(preds);
      renderPredictions(preds);
      requestAnimationFrame(detectObjects);
    } else {
      requestAnimationFrame(detectObjects);
    }
  }, [model]);

  useEffect(() => {
    if (model) {
      requestAnimationFrame(detectObjects);
    }
  }, [model, detectObjects]);

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

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
      <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
        Real-Time Object Detection
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
        {/* Floating labels for predictions */}
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
      <p className="mt-4 text-gray-300">Powered by TensorFlow.js & COCO-SSD</p>
    </div>
  );
};

export default ObjectDetection;
