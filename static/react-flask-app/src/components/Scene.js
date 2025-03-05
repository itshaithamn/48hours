import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const Scene = () => {
    const [testTubePositions, setTestTubePositions] = useState([]);
const [valvePositions, setValvePositions] = useState([]);
const [pumpPositions, setPumpPositions] = useState([]);
const [pipePositions, setPipePositions] = useState([]);

    const mountRef = useRef(null);
    const controlsRef = useRef(null);
    const objectsRef = useRef([]);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const orbitControlsRef = useRef(null);
    
    const [draggingItem, setDraggingItem] = useState(null);

    useEffect(() => {
        if (!mountRef.current) return;

        // Clear existing scene if it exists
        if (sceneRef.current) {
            sceneRef.current.clear();
            objectsRef.current = [];
        }

        // Setup Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        // Setup Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // Setup Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Add Grid Helper
        const gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0x555555);
        scene.add(gridHelper);

        // Orbit Controls
        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.minDistance = 3;
        orbitControls.maxDistance = 20;
        orbitControlsRef.current = orbitControls;

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Drag Controls
        if (controlsRef.current) controlsRef.current.dispose();
        const dragControls = new DragControls(objectsRef.current, camera, renderer.domElement);
        controlsRef.current = dragControls;

        dragControls.addEventListener("dragstart", () => { orbitControls.enabled = false; });
        dragControls.addEventListener("dragend", () => { orbitControls.enabled = true; });

        // Handle Window Resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
        };
        window.addEventListener("resize", handleResize);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            orbitControls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            controlsRef.current?.dispose();
            orbitControlsRef.current?.dispose();
            renderer.dispose();
            window.removeEventListener("resize", handleResize);
            if (mountRef.current) mountRef.current.innerHTML = "";
        };
    }, []);

    // Handle Drag & Drop
    const handleDrop = (event) => {
        event.preventDefault();
        if (!draggingItem || !sceneRef.current || !cameraRef.current) return;

        const rect = mountRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
        const intersects = raycaster.intersectObject(sceneRef.current.children.find(obj => obj.type === "GridHelper"));

        if (intersects.length > 0) {
            addObjectToScene(draggingItem, intersects[0].point);
        }
        setDraggingItem(null);
    };

    // Function to Add Objects to Scene
    const addObjectToScene = (type, position) => {
        if (!sceneRef.current) return;
        let object;
        const yPosition = 0;
        const id = Date.now(); // Generate a unique ID for each object
    
        if (type === "testTube") {
            object = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 2, 32),
                new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7, shininess: 100 })
            );
            setTestTubePositions((prev) => [
                ...prev,
                { id, position: { x: position.x, y: yPosition, z: position.z } },
            ]);
        } else if (type === "valve") {
            const loader = new GLTFLoader();
            loader.load(
                "/uploads-files-2965933-valveAssem.glb",
                (gltf) => {
                    const valve = gltf.scene;
                    valve.position.set(position.x, yPosition, position.z);
                    valve.scale.set(0.003, 0.003, 0.005);
                    sceneRef.current.add(valve);
                    objectsRef.current.push(valve);
                    setValvePositions((prev) => [
                        ...prev,
                        { id, position: { x: position.x, y: yPosition, z: position.z } },
                    ]);
                },
                undefined,
                (error) => console.error("Error loading valve model:", error)
            );
            return;
        } else if (type === "pump") {
            const loader = new GLTFLoader();
            loader.load(
                "/uploads_files_2431043_pump.glb",
                (gltf) => {
                    const pump = gltf.scene;
                    pump.position.set(position.x, yPosition, position.z);
                    pump.scale.set(0.005, 0.005, 0.005);
                    sceneRef.current.add(pump);
                    objectsRef.current.push(pump);
                    setPumpPositions((prev) => [
                        ...prev,
                        { id, position: { x: position.x, y: yPosition, z: position.z } },
                    ]);
                },
                undefined,
                (error) => console.error("Error loading pump model:", error)
            );
            return;
        } else if (type === "pipe") {
            const loader = new GLTFLoader();
            loader.load(
                "/uploads-files-2241660-pipes.glb",
                (gltf) => {
                    const pipe = gltf.scene;
                    pipe.position.set(position.x, yPosition, position.z);
                    pipe.scale.set(0.002, 0.002, 0.002);
                    sceneRef.current.add(pipe);
                    objectsRef.current.push(pipe);
                    setPipePositions((prev) => [
                        ...prev,
                        { id, position: { x: position.x, y: yPosition, z: position.z } },
                    ]);
                },
                undefined,
                (error) => console.error("Error loading pipe model:", error)
            );
            return;
        }
        
        if (object) {
            object.position.set(position.x, yPosition, position.z);
            sceneRef.current.add(object);
            objectsRef.current.push(object);
        }
    };

    const updateObjectPosition = (object, newPosition) => {
        if (object.name.includes("valve")) {
            setValvePositions((prev) =>
                prev.map((item) =>
                    item.id === object.userData.id ? { ...item, position: newPosition } : item
                )
            );
        } else if (object.name.includes("pump")) {
            setPumpPositions((prev) =>
                prev.map((item) =>
                    item.id === object.userData.id ? { ...item, position: newPosition } : item
                )
            );
        } else if (object.name.includes("pipe")) {
            setPipePositions((prev) =>
                prev.map((item) =>
                    item.id === object.userData.id ? { ...item, position: newPosition } : item
                )
            );
        }
    };
    
        

// Update position when drag event occurs
useEffect(() => {
    if (!sceneRef.current) return;

    const dragControls = new DragControls(objectsRef.current, cameraRef.current, rendererRef.current.domElement);

    dragControls.addEventListener("dragstart", () => { orbitControlsRef.current.enabled = false; });
    dragControls.addEventListener("dragend", () => { orbitControlsRef.current.enabled = true; });

    dragControls.addEventListener("drag", (event) => {
        if (event.object) {
            // Constrain y position to 0 and update position
            event.object.position.y = 0;
            updateObjectPosition(event.object, event.object.position);
        }
    });

    return () => {
        dragControls.dispose();
    };
}, []);

    
    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
            {/* Sidebar */}
            <div style={{ width: "150px", background: "#222", padding: "10px", color: "white" }}>
                <p>Drag objects:</p>
                <div draggable onDragStart={() => setDraggingItem("testTube")} 
                     style={{ width: "50px", height: "50px", background: "#0ff", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     Tube
                </div>
                <div draggable onDragStart={() => setDraggingItem("valve")} 
                     style={{ width: "50px", height: "50px", background: "#f00", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     Valve
                </div>
                <div draggable onDragStart={() => setDraggingItem("pump")} 
                     style={{ width: "50px", height: "50px", background: "#00f", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     Pump
                </div>
                <div draggable onDragStart={() => setDraggingItem("pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     Pipe
                </div>
                <div style={{ position: "absolute", top: 10, left: 160, color: "white", fontSize: "14px" }}>
    <h3>Object Coordinates:</h3>
    {valvePositions.map(({ id, position }) => (
        <p key={id}>Valve: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    ))}
    {pumpPositions.map(({ id, position }) => (
        <p key={id}>Pump: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    ))}
    {pipePositions.map(({ id, position }) => (
        <p key={id}>Pipe: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    ))}
</div>

            </div>

            {/* Scene Container */}
            <div ref={mountRef} style={{ flex: 1, overflow: "hidden" }} 
                 onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} />
        </div>
    );
};

export default Scene;
