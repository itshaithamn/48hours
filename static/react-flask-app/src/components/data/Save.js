import * as THREE from "three";
import jsonData from "./3dfile.json";
import { useEffect, useRef } from "react"

const Save = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // light and camera position provided by your friend at chat.com/ihateai
    camera.position.set(0, 0, 200);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    var renderer = new THREE.WebGLRenderer();
    var loader = new THREE.ObjectLoader();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // parse the imported JSON data to create object
    const loadedObject = loader.parse(jsonData);
    scene.add(loadedObject);
    // container div type
    containerRef.current && containerRef.current.appendChild( renderer.domElement);
    renderer.render(scene, camera);
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }}></div>
  );
};

export default Save;
