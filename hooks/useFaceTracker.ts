"use client";

import { useEffect, useRef, useState } from "react";

export function useFaceTracker(videoElement: HTMLVideoElement | null, isActive: boolean) {
  const [bodyLanguageScore, setBodyLanguageScore] = useState<number>(100);
  const faceLandmarkerRef = useRef<any>(null);
  const requestRef = useRef<number | null>(null);
  
  // Scoring metrics
  const totalFrames = useRef(0);
  const goodFrames = useRef(0);

  useEffect(() => {
    let isCancelled = false;

    const initMediaPipe = async () => {
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (!isCancelled) {
          faceLandmarkerRef.current = faceLandmarker;
          console.log("Face landmarker initialized");
        }
      } catch (e) {
        console.error("Failed to initialize FaceLandmarker", e);
      }
    };

    if (isActive) {
      initMediaPipe();
    }

    return () => {
      isCancelled = true;
      if (faceLandmarkerRef.current) {
        if (typeof (faceLandmarkerRef.current as any).close === 'function') {
          (faceLandmarkerRef.current as any).close();
        }
        faceLandmarkerRef.current = null;
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !videoElement || !faceLandmarkerRef.current) return;

    let lastVideoTime = -1;

    const predictWebcam = () => {
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        if (isActive) requestAnimationFrame(predictWebcam);
        return;
      }

      if (videoElement.currentTime !== lastVideoTime && faceLandmarkerRef.current) {
        lastVideoTime = videoElement.currentTime;
        const results = faceLandmarkerRef.current.detectForVideo(videoElement, performance.now());
        
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          
          // Basic posture/eye contact check
          // Nose tip is landmark 1
          // Left eye is ~33, Right eye is ~263
          const nose = landmarks[1];
          const leftEye = landmarks[33];
          const rightEye = landmarks[263];
          
          // Calculate center of eyes
          const eyeCenterX = (leftEye.x + rightEye.x) / 2;
          
          // Check if nose is relatively centered between eyes (looking forward)
          const lookingForward = Math.abs(nose.x - eyeCenterX) < 0.05;
          
          totalFrames.current += 1;
          if (lookingForward) {
            goodFrames.current += 1;
          }
          
          // Update score periodically to avoid too many re-renders
          if (totalFrames.current % 30 === 0) {
            const score = Math.round((goodFrames.current / totalFrames.current) * 100);
            setBodyLanguageScore(score);
          }
        } else {
          // No face detected -> bad frame
          totalFrames.current += 1;
          if (totalFrames.current % 30 === 0) {
            const score = Math.round((goodFrames.current / totalFrames.current) * 100);
            setBodyLanguageScore(score);
          }
        }
      }
      
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    requestRef.current = requestAnimationFrame(predictWebcam);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isActive, videoElement, faceLandmarkerRef.current]); // Add faceLandmarkerRef.current to dependencies so loop starts when it loads

  return { bodyLanguageScore };
}
