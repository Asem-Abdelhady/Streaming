import React, { useEffect, useRef, useState } from "react";
import { Stack, styled } from "@mui/material";

const StreamContainer = styled("div")`
  height: 80%;
`;

const ObjectsContainer = styled("div")`
  flex: 1;
`;

export default function Stream() {
  const [dataChannelLog, setDataChannelLog] = useState<string[]>([]);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    start();
    return () => {
      // Clean up on unmount
      if (dcRef.current) {
        dcRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, []);

  const createPeerConnection = () => {
    const config: RTCConfiguration = {
      sdpSemantics: "unified-plan",
    };

    const pc = new RTCPeerConnection(config);

    // Add track event listener for incoming media streams
    pc.addEventListener("track", (evt) => {
      if (evt.track.kind === "video") {
        if (videoRef.current) {
          videoRef.current.srcObject = evt.streams[0];
        }
      }
    });

    pcRef.current = pc;
    return pc;
  };

  const negotiate = async () => {
    if (!pcRef.current) return;

    try {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        if (pcRef.current?.iceGatheringState === "complete") {
          resolve();
        } else {
          const checkState = () => {
            if (pcRef.current?.iceGatheringState === "complete") {
              pcRef.current?.removeEventListener(
                "icegatheringstatechange",
                checkState
              );
              resolve();
            }
          };
          pcRef.current?.addEventListener(
            "icegatheringstatechange",
            checkState
          );
        }
      });

      const response = await fetch(
        "https://8674-188-130-155-155.ngrok-free.app/offer",
        {
          body: JSON.stringify({
            sdp: pcRef.current.localDescription?.sdp,
            type: pcRef.current.localDescription?.type,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );

      const answer = await response.json();
      await pcRef.current.setRemoteDescription(answer);
    } catch (e) {
      console.error(e);
    }
  };

  const start = async () => {
    const pc = createPeerConnection();

    dcRef.current = pc.createDataChannel("chat", {
      ordered: false,
      maxRetransmits: 0,
    });

    dcRef.current.onclose = () => {
      setDataChannelLog((prevLogs) => [...prevLogs, "- close"]);
    };

    dcRef.current.onopen = () => {
      setDataChannelLog((prevLogs) => [...prevLogs, "- open"]);
      setInterval(() => {
        const message = "bed|cell phone|person";
        dcRef.current?.send(message);
      }, 1000);
    };

    dcRef.current.onmessage = (evt) => {
      console.log("Received message", evt.data);
      setDataChannelLog((prevLogs) => [...prevLogs, "< " + evt.data]);
    };

    const constraints: MediaStreamConstraints = {
      video: true,
    };

    if (constraints.video) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        await negotiate();
      } catch (err) {
        console.error("Could not acquire media: " + err);
      }
    } else {
      await negotiate();
    }
  };

  return (
    <Stack sx={{ height: "100%" }}>
      <StreamContainer>
        <video ref={videoRef} autoPlay playsInline />
      </StreamContainer>
      <ObjectsContainer>
        {dataChannelLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </ObjectsContainer>
    </Stack>
  );
}
