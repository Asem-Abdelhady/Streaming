import React, { useState, useEffect, useRef } from "react";
import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";
import { Button, CircularProgress, Typography, Box } from "@mui/material";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Stream: React.FC = () => {
  const [faceDetector, setFaceDetector] = useState<FaceDetector | undefined>(
    undefined
  );
  const [detectedFaces, setDetectedFaces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function initializeDetectors() {
      try {
        // const vision = await FilesetResolver.forVisionTasks(
        //   "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
        // );

        // const newObjectDetector = await ObjectDetector.createFromOptions(
        //   vision,
        //   {
        //     baseOptions: {
        //       modelAssetPath:
        //         "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
        //       delegate: "CPU",
        //     },
        //     scoreThreshold: 0.15,
        //     runningMode: "VIDEO",
        //   }
        // );
        // setObjectDetector(newObjectDetector);

        const visionFace = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const newFaceDetector = await FaceDetector.createFromOptions(
          visionFace,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
          }
        );
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
      if (!faceDetector) {
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
  }, [faceDetector, isWebcamEnabled, isLoading, error]);

  const startObjectDetection = async () => {
    if (!videoRef.current || !faceDetector) return;

    // let selectedObjectsBoxes: Box[] = [];
    const predictWebcam = async () => {
      // const startTimeMs = performance.now();
      // const detections = objectDetector.detectForVideo(
      //   videoRef.current!,
      //   startTimeMs
      // );
      // const newDetectedObjects = detections.detections
      //   .filter((detection) =>
      //     selectedObjects.includes(detection.categories[0].categoryName)
      //   )
      //   .map((detection) => {
      //     const box: Box = {
      //       x: detection.boundingBox!.originX,
      //       y: detection.boundingBox!.originY,
      //       width: detection.boundingBox!.width,
      //       height: detection.boundingBox!.height,
      //     };
      //     selectedObjectsBoxes.push(box);
      //     return `${detection.categories[0].categoryName} - ${Math.round(
      //       detection.categories[0].score * 100
      //     )}%`;
      //   });
      // setDetectedObjects(newDetectedObjects);

      // setDetectionBoxes(selectedObjectsBoxes);
      let lastVideoTime = -1;
      const startTimeMs = performance.now();
      if (videoRef.current!.currentTime !== lastVideoTime) {
        lastVideoTime = videoRef.current!.currentTime;
        const faceDetections = faceDetector.detectForVideo(
          videoRef.current!,
          startTimeMs
        );
        const newDetectedFaces = faceDetections.detections.map(
          (detection) =>
            `Face - ${Math.round(detection.categories[0].score * 100)}%`
        );
        setDetectedFaces(newDetectedFaces);
        console.log("Here: ", faceDetections);
        console.log("Detected faces: ", detectedFaces);
      }
      // const faceDetections = faceDetector.detectForVideo(
      //   videoRef.current!,
      //   startTimeMs
      // );

      // selectedObjectsBoxes = [];
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
      </Box>
    </Box>
  );
};

export default Stream;
