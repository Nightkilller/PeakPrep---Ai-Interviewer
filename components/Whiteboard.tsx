"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";

export interface WhiteboardRef {
  getCanvasImage: () => Promise<string | null>;
}

const Whiteboard = forwardRef<WhiteboardRef, {}>((props, ref) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    getCanvasImage: async () => {
      if (!excalidrawAPI) return null;
      const elements = excalidrawAPI.getSceneElements();
      if (!elements || elements.length === 0) return null;
      
      try {
        const blob = await exportToBlob({
          elements,
          appState: excalidrawAPI.getAppState(),
          mimeType: "image/png",
        });

        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Failed to export whiteboard image:", err);
        return null;
      }
    }
  }));

  return (
    <div className="w-full h-full relative" style={{ minHeight: "500px" }}>
      <Excalidraw
        excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
        theme="light"
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: false,
            saveToActiveFile: false,
          }
        }}
      />
    </div>
  );
});

Whiteboard.displayName = "Whiteboard";

export default Whiteboard;
