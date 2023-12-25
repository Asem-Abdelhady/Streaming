import React, { useState, useEffect, useRef } from "react";
import {
  ObjectDetector,
  FilesetResolver,
  FaceDetector,
} from "@mediapipe/tasks-vision";
import { useLocation } from "react-router-dom";
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  List,
  ListItem,
} from "@mui/material";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Stream: React.FC = () => {
  const [objectDetector, setObjectDetector] = useState<ObjectDetector | null>(
    null
  );
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  // const [detectedFaces, setDetectedFaces] = useState<string[]>([]);
  const [detectionBoxes, setDetectionBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const location = useLocation();
  const selectedObjects =
    new URLSearchParams(location.search).get("selectedObjects")?.split(",") ||
    [];

  useEffect(() => {
    async function initializeDetectors() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
        );

        const newObjectDetector = await ObjectDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
              delegate: "GPU",
            },
            scoreThreshold: 0.15,
            runningMode: "VIDEO",
          }
        );
        setObjectDetector(newObjectDetector);

        const newFaceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        });
        setFaceDetector(newFaceDetector);

        setIsLoading(false);
      } catch (initializationError) {
        setError("Failed to initialize detectors");
        console.error(initializationError);
      }
    }

    initializeDetectors();
  }, []);

  useEffect(() => {
    async function enableCam() {
      if (!objectDetector) {
        return;
      }
      try {
        const constraints = { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          startObjectDetection();
        }
      } catch (webcamError) {
        setError("Error accessing the webcam");
        console.error(webcamError);
      }
    }

    if (isWebcamEnabled && !isLoading && !error) {
      enableCam();
    }
  }, [objectDetector, faceDetector, isWebcamEnabled, isLoading, error]);

  const startObjectDetection = async () => {
    if (!videoRef.current || !objectDetector || !faceDetector) return;

    const predictWebcam = async () => {
      const startTimeMs = performance.now();
      const detections = await objectDetector.detectForVideo(
        videoRef.current!,
        startTimeMs
      );
      const newDetectedObjects = detections.detections
        .filter((detection) =>
          selectedObjects.includes(detection.categories[0].categoryName)
        )
        .map(
          (detection) =>
            `${detection.categories[0].categoryName} - ${Math.round(
              detection.categories[0].score * 100
            )}%`
        );
      setDetectedObjects(newDetectedObjects);

      const boxes = detections.detections.map((detection) => ({
        x: detection.boundingBox!.originX,
        y: detection.boundingBox!.originY,
        width: detection.boundingBox!.width,
        height: detection.boundingBox!.height,
      }));

      setDetectionBoxes(boxes);

      // const faceDetections = await faceDetector.detectForVideo(
      //   videoRef.current!,
      //   startTimeMs
      // );
      // const newDetectedFaces = faceDetections.detections.map(
      //   (detection) =>
      //     `Face - ${Math.round(detection.categories[0].score * 100)}%`
      // );
      // setDetectedFaces(newDetectedFaces);

      requestAnimationFrame(predictWebcam);
    };

    predictWebcam();
  };

  return (
    <Box sx={{ position: "relative", width: "640px", height: "480px" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "640px", height: "480px", position: "absolute" }}
      />
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Typography
          color="error"
          sx={{ position: "absolute", top: "10px", left: "10px" }}
        >
          Error: {error}
        </Typography>
      )}
      {!isWebcamEnabled && !isLoading && (
        <Button
          variant="contained"
          onClick={() => setIsWebcamEnabled(true)}
          sx={{ position: "absolute", zIndex: 1, top: "10px", left: "10px" }}
        >
          Enable Webcam
        </Button>
      )}
      {detectionBoxes.map((box, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            left: box.x,
            top: box.y,
            width: box.width,
            height: box.height,
            border: "2px solid red",
            boxSizing: "border-box",
          }}
        />
      ))}
      <Box
        sx={{
          position: "absolute",
          top: "10px",
          left: "660px",
          width: "200px",
          height: "460px",
          overflow: "auto",
          backgroundColor: "background.paper",
          padding: "10px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Detected Objects
        </Typography>
        <List>
          {detectedObjects.map((obj, index) => (
            <ListItem key={index}>{obj}</ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Stream;
