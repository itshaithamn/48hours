import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const TestScene = () => {
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

        async function post(request){
        try{
            const response = await fetch(request);
            const result = await response.json();
            console.log("Success: ", result);
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    function handleSaveFile(e) {
        if(sceneRef.current) {
            // Export scene grabs current scene, sceneJSON is the json
            // script of the scene, file is a file of the JSON script.
            const exportScene = sceneRef.current;
            const sceneJSON = exportScene.toJSON();
            const file = JSON.stringify(sceneJSON);

            const scenejsonRequest = new Request("http://3.219.182.232/scenejson_request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: file,
            });

            post(scenejsonRequest);
        }
    }



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

        // Restrict movement within boundaries
        dragControls.addEventListener("drag", (event) => {
            const object = event.object;
            
            // Define the grid boundaries
            const minX = -5, maxX = 5;
            const minZ = -5, maxZ = 5;
        
            // Constrain the object's position within the grid
            object.position.x = Math.max(minX, Math.min(maxX, object.position.x));
            object.position.z = Math.max(minZ, Math.min(maxZ, object.position.z));
        
            // Keep the y position fixed if needed
            object.position.y = 0.5; 
        });
        

        // Disable orbiting when dragging
        dragControls.addEventListener("dragstart", () => {
            orbitControls.enabled = false;
        });

        dragControls.addEventListener("dragend", () => {
            orbitControls.enabled = true;
        });

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
        const id = Date.now(); // Unique ID
        
        if (type === "testTube") {
            object = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 2, 32),
                new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7, shininess: 100 })
            );
            object.position.set(position.x, yPosition, position.z);
            object.name = `testTube-${id}`;
            sceneRef.current.add(object);
            objectsRef.current.push(object);
            setTestTubePositions((prev) => [...prev, { id, position: object.position }]);
        } 
    
        else if (type === "pump") {
            const objLoader = new OBJLoader();
            objLoader.load(
                "uploads-files-2431043-pump.obj",
                (obj) => {
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.load(
                        "pump_Mixed_AO.png",
                        (texture) => {
                            obj.traverse((child) => {
                                if (child.isMesh) {
                                    child.material.map = texture;
                                    child.material.needsUpdate = true;
                                }
                            });
    
                            obj.position.set(position.x, yPosition, position.z);
                            obj.scale.set(0.005, 0.005, 0.005);
                            obj.name = `pump-${id}`;
                            sceneRef.current.add(obj);
                            objectsRef.current.push(obj);
    
                            setPumpPositions((prev) => [...prev, { id, position: obj.position }]);
    
                         



    
                            console.log("Pump loaded and added to drag controls.");
                        },
                        undefined,
                        (error) => console.error("Error loading texture:", error)
                    );
                },
                undefined,
                (error) => console.error("Error loading pump model:", error)
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
    
        
    

 
    

    
    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
            {/* Sidebar */}
            <div style={{ width: "150px", background: "#222", padding: "10px", color: "white" }}>
                <p>Drag objects:</p>
                <div draggable onDragStart={() => setDraggingItem("testTube")} 
                     style={{ width: "50px", height: "50px", background: "#0ff", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     Tube
                </div>
               
                <div draggable onDragStart={() => setDraggingItem("pump")} 
                     style={{ width: "50px", height: "50px", background: "#00f", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     Pump
                </div>
                
                <div style={{ position: "absolute", top: 10, left: 160, color: "white", fontSize: "14px" }}>
                    <button onClick={handleSaveFile}>Save File</button>
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

export default TestScene;
