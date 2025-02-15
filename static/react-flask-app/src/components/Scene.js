import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";

const Scene = () => {
    const mountRef = useRef(null);
    const controlsRef = useRef(null);
    const objectsRef = useRef([]);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const orbitControlsRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Cleanup previous scene
        if (sceneRef.current) {
            sceneRef.current.clear();
            objectsRef.current = [];
        }

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Add grid helper
        const gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0x555555);
        scene.add(gridHelper);

        // Add orbit controls
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.minDistance = 3;
        orbitControls.maxDistance = 20;
        orbitControlsRef.current = orbitControls;

        // Create a draggable cube
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0.5, 0);
        scene.add(cube);
        objectsRef.current = [cube];

        // Initialize DragControls
        if (controlsRef.current) {
            controlsRef.current.dispose();
        }
        const dragControls = new DragControls(objectsRef.current, camera, renderer.domElement);
        controlsRef.current = dragControls;

        // Restrict movement within boundaries
        dragControls.addEventListener("drag", (event) => {
            const object = event.object;
            const minX = -5, maxX = 5;
            const minZ = -5, maxZ = 5;

            // Restrict movement within the grid area
            object.position.x = Math.max(minX, Math.min(maxX, object.position.x));
            object.position.z = Math.max(minZ, Math.min(maxZ, object.position.z));

            // Keep cube on top of the grid (do not allow lifting)
            object.position.y = 0.5; 
        });

        // Disable orbiting when dragging
        dragControls.addEventListener("dragstart", () => {
            orbitControls.enabled = false;
        });

        dragControls.addEventListener("dragend", () => {
            orbitControls.enabled = true;
        });

        // Resize handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
        };
        window.addEventListener("resize", handleResize);

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            orbitControls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            controlsRef.current?.dispose();
            orbitControlsRef.current?.dispose();
            renderer.dispose();
            window.removeEventListener("resize", handleResize);
            if (mountRef.current) {
                mountRef.current.innerHTML = "";
            }
        };
    }, []);

    return <div ref={mountRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }} />;
};

export default Scene;
