import React, { useState, useEffect, useRef } from "react";
import {
  ObjectDetector,
  FilesetResolver,
  ObjectDetectorResult,
} from "@mediapipe/tasks-vision";

import { useLocation } from "react-router-dom";

const Stream: React.FC = () => {
  const [objectDetector, setObjectDetector] = useState<ObjectDetector | null>(
    null
  );
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveViewRef = useRef<HTMLDivElement>(null);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState<boolean>(false);

  const location = useLocation();
  const selectedObjectsParam = new URLSearchParams(location.search).get(
    "selectedObjects"
  );

  const selectedObjects = selectedObjectsParam
    ? selectedObjectsParam.split(",")
    : [];

  useEffect(() => {
    const initializeObjectDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
      );
      const detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
          delegate: "GPU",
        },
        scoreThreshold: 0.15,
        runningMode: "VIDEO",
      });
      setObjectDetector(detector);
    };
    initializeObjectDetector();
  }, []);

  const enableCam = async () => {
    if (!objectDetector) {
      console.log("Wait! objectDetector not loaded yet.");
      return;
    }
    const constraints = { video: true };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      }
    } catch (error) {
      console.error("Error accessing the webcam", error);
    }
    setIsWebcamEnabled(true);
  };

  const predictWebcam = async () => {
    if (!videoRef.current || videoRef.current.readyState < 2 || !objectDetector)
      return;
    const startTimeMs = performance.now();
    const detections = await objectDetector.detectForVideo(
      videoRef.current,
      startTimeMs
    );
    displayVideoDetections(detections);
    window.requestAnimationFrame(predictWebcam);
  };

  const displayVideoDetections = (result: ObjectDetectorResult) => {
    if (!liveViewRef.current) return;

    while (liveViewRef.current.firstChild) {
      liveViewRef.current.removeChild(liveViewRef.current.firstChild);
    }

    const newDetectedObjects = result.detections.map(
      (detection) =>
        `${detection.categories[0].categoryName} - ${Math.round(
          detection.categories[0].score * 100
        )}%`
    );

    const filtered = newDetectedObjects.filter((obj) =>
      selectedObjects.includes(obj.split(" - ")[0])
    );

    setDetectedObjects(filtered);

    result.detections.forEach((detection) => {
      const highlighter = document.createElement("div");
      highlighter.style.position = "absolute";

      const scaleX = 1.0; // Keep scale factor as 1.0
      const scaleY = 1.0; // Keep scale factor as 1.0
      highlighter.style.left = `${detection.boundingBox!.originX * scaleX}px`;
      highlighter.style.top = `${detection.boundingBox!.originY * scaleY}px`;
      highlighter.style.width = `${detection.boundingBox!.width * scaleX}px`;
      highlighter.style.height = `${detection.boundingBox!.height * scaleY}px`;
      highlighter.style.border = "2px solid red";
      highlighter.style.boxSizing = "border-box";

      liveViewRef.current?.appendChild(highlighter);
    });
  };

  return (
    <div style={{ position: "relative", width: "640px", height: "480px" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "640px", height: "480px", position: "absolute" }}
      />
      {!isWebcamEnabled && (
        <button onClick={enableCam} style={{ position: "absolute", zIndex: 1 }}>
          Enable Webcam
        </button>
      )}
      <div
        ref={liveViewRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "660px",
          width: "200px",
          height: "460px",
          overflow: "auto",
        }}
      >
        <h2>Detected Objects</h2>
        <ul>
          {detectedObjects.map((obj, index) => (
            <li key={index}>{obj}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Stream;
