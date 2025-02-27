import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import jsonData from "./3dfile.json";
import scene from "../Scene";

const Save = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const loader = new THREE.ObjectLoader();

    // Parse the imported JSON data to create a Three.js object
    const loadedObject = loader.parse(jsonData);
    scene.add(loadedObject);

    // Append the renderer's canvas to the container div
    if (containerRef.current && renderer) {
      containerRef.current.appendChild(renderer.domElement);
    }
  }, []);

  return (
    <div
      id="scene-container"
      ref={containerRef}
      style={{ width: "100%", height: "100vh" }}
    >
      <h1>hello</h1>
    </div>
  );
};

export default Save;
