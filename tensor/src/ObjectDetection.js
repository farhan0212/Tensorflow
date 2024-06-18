import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const ObjectDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);

  const loadModel = useCallback(async () => {
    const loadedModel = await cocoSsd.load();
    setModel(loadedModel);
  }, []);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  const detectObjects = useCallback(async () => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4 &&
      model
    ) {
      const video = webcamRef.current.video;
      const predictions = await model.detect(video);
      renderPredictions(predictions);
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

  const renderPredictions = (predictions) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.font = "18px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(prediction.class, x, y > 10 ? y - 5 : y + 18);
    });
  };

  return (
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        audio={false}
        className="absolute w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      <canvas
        ref={canvasRef}
        className="absolute w-full h-full"
        width="640"
        height="480"
      />
    </div>
  );
};

export default ObjectDetection;
