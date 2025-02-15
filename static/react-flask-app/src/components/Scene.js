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
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Grid properties
        const gridSize = 10;
        const gridDivisions = 10;
        const cellSize = gridSize / gridDivisions;

        // Add grid helper
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xffffff, 0x555555);
        scene.add(gridHelper);

        // Add orbit controls
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.minDistance = 3;
        orbitControls.maxDistance = 20;
        orbitControlsRef.current = orbitControls;

        // Add lighting for better visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Create a "test tube" shape (CylinderGeometry)
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.7,
            shininess: 100
        });
        const testTube = new THREE.Mesh(geometry, material);
        testTube.position.set(0, 1, 0);
        scene.add(testTube);
        objectsRef.current = [testTube];

        // Initialize DragControls
        if (controlsRef.current) {
            controlsRef.current.dispose();
        }
        const dragControls = new DragControls(objectsRef.current, camera, renderer.domElement);
        controlsRef.current = dragControls;

        // Restrict movement and snap to grid square centers on drop
        dragControls.addEventListener("drag", (event) => {
            const object = event.object;
            const minX = -gridSize / 2, maxX = gridSize / 2;
            const minZ = -gridSize / 2, maxZ = gridSize / 2;

            // Restrict movement within the grid area
            object.position.x = Math.max(minX, Math.min(maxX, object.position.x));
            object.position.z = Math.max(minZ, Math.min(maxZ, object.position.z));

            // Keep test tube floating above the grid
            object.position.y = 1; 
        });

        // Snap to nearest grid square **center** when dropping
        dragControls.addEventListener("dragend", (event) => {
            const object = event.object;

            // Offset snapping by half a grid cell so it lands in the **center** of a square
            object.position.x = Math.round(object.position.x / cellSize) * cellSize + cellSize / 2;
            object.position.z = Math.round(object.position.z / cellSize) * cellSize + cellSize / 2;
            object.position.y = 1; // Keep it above the grid
        });

        // Disable orbiting while dragging
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
