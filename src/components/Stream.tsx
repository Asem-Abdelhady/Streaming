import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ObjectDetector,
  FilesetResolver,
  FaceDetector,
} from "@mediapipe/tasks-vision";
import {
  Button,
  CircularProgress,
  Typography,
  Box,
  List,
  ListItem,
  styled,
  Stack,
} from "@mui/material";
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

const VideoContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
});

const Stream: React.FC = () => {
  const [objectDetector, setObjectDetector] = useState<
    ObjectDetector | undefined
  >(undefined);
  const [faceDetector, setFaceDetector] = useState<FaceDetector | undefined>(
    undefined
  );
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [detectedFaces, setDetectedFaces] = useState<string[]>([]);
  const [detectionBoxes, setDetectionBoxes] = useState<Box[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedObjects =
    new URLSearchParams(location.search).get("selectedObjects")?.split(",") ||
    [];

  const predictWebcam = useCallback(async () => {
    if (!videoRef.current || !objectDetector || !faceDetector) return;
    let selectedObjectsBoxes: Box[] = [];
    const startTimeMs = performance.now();
    const detections = objectDetector.detectForVideo(
      videoRef.current!,
      startTimeMs
    );
    console.log("KFKL:JSD:LF", selectedObjects);
    const newDetectedObjects = detections.detections
      .filter((detection) =>
        selectedObjects.includes(detection.categories[0].categoryName)
      )
      .map((detection) => {
        const box: Box = {
          x: detection.boundingBox!.originX,
          y: detection.boundingBox!.originY,
          width: detection.boundingBox!.width,
          height: detection.boundingBox!.height,
        };
        selectedObjectsBoxes.push(box);
        return `${detection.categories[0].categoryName} - ${Math.round(
          detection.categories[0].score * 100
        )}%`;
      });

    const faceDetections = faceDetector.detectForVideo(
      videoRef.current!,
      startTimeMs
    );
    const newDetectedFaces = faceDetections.detections.map((detection) => {
      const box: Box = {
        x: detection.boundingBox!.originX,
        y: detection.boundingBox!.originY,
        width: detection.boundingBox!.width,
        height: detection.boundingBox!.height,
      };
      selectedObjectsBoxes.push(box);
      return `Face - ${Math.round(detection.categories[0].score * 100)}%`;
    });

    setDetectedFaces(newDetectedFaces);
    setDetectedObjects(newDetectedObjects);
    setDetectionBoxes(selectedObjectsBoxes);

    selectedObjectsBoxes = [];
    requestAnimationFrame(predictWebcam);
  }, [faceDetector, objectDetector]);

  useEffect(() => {
    async function initializeDetectors() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const newObjectDetector = await ObjectDetector.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
              delegate: "GPU",
            },
            scoreThreshold: 0.6,
            runningMode: "VIDEO",
          }
        );
        setObjectDetector(newObjectDetector);

        const newFaceDetector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
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
      if (!objectDetector || !faceDetector) {
        return;
      }
      try {
        const constraints = { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadeddata", predictWebcam);
        }
      } catch (webcamError) {
        setError("Error accessing the webcam");
        console.error(webcamError);
      }
    }

    if (isWebcamEnabled && !isLoading && !error) {
      enableCam();
    }
  }, [
    objectDetector,
    faceDetector,
    isWebcamEnabled,
    isLoading,
    error,
    predictWebcam,
  ]);

  useEffect(() => {
    const drawDetectionBoxes = (boxes: Box[]) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        boxes.forEach((box) => {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });
      }
    };

    drawDetectionBoxes(detectionBoxes);
  }, [detectionBoxes]);

  return (
    <Stack direction="row" gap="16px" padding="24px">
      <VideoContainer>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "640px", height: "480px" }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ position: "absolute" }}
        />
        {isLoading && <CircularProgress />}
        {error && <Typography color="error">Error: {error}</Typography>}
        {!isWebcamEnabled && !isLoading && (
          <Button variant="contained" onClick={() => setIsWebcamEnabled(true)}>
            Enable Webcam
          </Button>
        )}
      </VideoContainer>
      <Stack direction="row" gap="12px" justifyContent="space-between" flex={1}>
        <Stack flex={1}>
          <Typography variant="h6" gutterBottom>
            Detected Objects
          </Typography>
          <List>
            {detectedObjects.map((obj, index) => (
              <ListItem key={index}>{obj}</ListItem>
            ))}
          </List>
        </Stack>
        <Stack flex={1}>
          <Typography variant="h6" gutterBottom>
            Detected Faces
          </Typography>
          <List>
            {detectedFaces.map((obj, index) => (
              <ListItem key={index}>{obj}</ListItem>
            ))}
          </List>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Stream;
