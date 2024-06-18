import React from "react";
import ObjectDetection from "./ObjectDetection";
import "./index.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-4xl font-bold">TensorFlow Object Detection</h1>

        <div className="flex justify-center items-center w-1/2 h-96">
          <ObjectDetection />
        </div>
      </header>
    </div>
  );
}

export default App;
