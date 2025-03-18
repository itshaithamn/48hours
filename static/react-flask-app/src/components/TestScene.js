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
    const pumpToHandleMap = useRef(new Map());
    
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
            pumpToHandleMap.current.clear();
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

        // Setup Drag Controls
        const dragControls = new DragControls(objectsRef.current, camera, renderer.domElement);
        controlsRef.current = dragControls;

        // Handle drag control events
        dragControls.addEventListener("drag", (event) => {
            const object = event.object;
            
            // Define the grid boundaries
            const minX = -5, maxX = 5;
            const minZ = -5, maxZ = 5;
            
            // Constrain the object's position within the grid
            object.position.x = Math.max(minX, Math.min(maxX, object.position.x));
            object.position.z = Math.max(minZ, Math.min(maxZ, object.position.z));
            
            // If this is a pump handle, move the associated pump
            if (object.userData?.isPumpHandle) {
                const pumpModel = object.userData.pumpModel;
                if (pumpModel) {
                    pumpModel.position.x = object.position.x;
                    pumpModel.position.z = object.position.z;
                    
                    // Update state for pump positions
                    setPumpPositions(prev => 
                        prev.map(item => 
                            item.id === pumpModel.userData.id ? 
                            { ...item, position: { 
                                x: object.position.x, 
                                y: pumpModel.position.y, 
                                z: object.position.z 
                            }} : item
                        )
                    );
                }
            } else if (object.name.includes("testTube")) {
                // Update test tube position state
                setTestTubePositions(prev => 
                    prev.map(item => 
                        item.id === object.userData.id ? 
                        { ...item, position: { ...object.position }} : item
                    )
                );
            }
            // Add handlers for other object types as needed
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

    // Function to create a drag handle for complex objects
    const createDragHandle = (parentObject, position, size = 0.5) => {
        // Create an invisible box as a drag handle
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.0  // Invisible by default, can be made visible for debugging
        });
        
        const handle = new THREE.Mesh(geometry, material);
        handle.position.set(position.x, position.y + size/2, position.z);
        handle.userData = {
            isPumpHandle: true,
            pumpModel: parentObject
        };
        
        // Add handle to scene and objects array
        sceneRef.current.add(handle);
        objectsRef.current.push(handle);
        
        // Update drag controls with the new handle
        if (controlsRef.current) {
            const currentObjects = controlsRef.current.getObjects();
            currentObjects.push(handle);
        }
        
        return handle;
    };

    // Function to Add Objects to Scene
    const addObjectToScene = (type, position) => {
        if (!sceneRef.current) return;
        
        const id = Date.now(); // Unique ID
        
        if (type === "testTube") {
            const testTube = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 2, 32),
                new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7, shininess: 100 })
            );
            testTube.position.set(position.x, 0.5, position.z);
            testTube.name = `testTube-${id}`;
            testTube.userData = { id, type: "testTube" };
            
            sceneRef.current.add(testTube);
            objectsRef.current.push(testTube);
            setTestTubePositions((prev) => [...prev, { id, position: { ...testTube.position } }]);
            
            // Update drag controls if needed
            if (controlsRef.current) {
                const currentObjects = controlsRef.current.getObjects();
                currentObjects.push(testTube);
            }
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
    
                            // Set initial position and scale
                            obj.position.set(position.x, 0, position.z);
                            obj.scale.set(0.005, 0.005, 0.005);
                            obj.name = `pump-${id}`;
                            obj.userData = { id, type: "pump" };
                            
                            // Add to scene but NOT to draggable objects
                            sceneRef.current.add(obj);
                            
                            // Create a drag handle for the pump
                            const handle = createDragHandle(obj, obj.position);
                            
                            // Store the reference in our map
                            pumpToHandleMap.current.set(obj.uuid, handle);
                            
                            // Add to state with position
                            setPumpPositions((prev) => [...prev, { 
                                id, 
                                position: { 
                                    x: obj.position.x, 
                                    y: obj.position.y, 
                                    z: obj.position.z 
                                } 
                            }]);
    
                            console.log("Pump loaded with drag handle.");
                        },
                        undefined,
                        (error) => console.error("Error loading texture:", error)
                    );
                },
                undefined,
                (error) => console.error("Error loading pump model:", error)
            );
        }
    };
    
    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
            {/* Sidebar */}
            <div style={{ width: "150px", background: "#222", padding: "10px", color: "white" }}>
                <p>Drag objects:</p>
                <div draggable onDragStart={() => setDraggingItem("testTube")} 
                     style={{ width: "50px", height: "50px", background: "#0ff", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px", marginBottom: "10px" }}>
                     Tube
                </div>
               
                <div draggable onDragStart={() => setDraggingItem("pump")} 
                     style={{ width: "50px", height: "50px", background: "#00f", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     Pump
                </div>
                
                <button 
                    onClick={handleSaveFile}
                    style={{ marginTop: "20px", padding: "5px 10px", cursor: "pointer" }}
                >
                    Save File
                </button>
            </div>

            {/* Scene Container */}
            <div ref={mountRef} style={{ flex: 1, overflow: "hidden" }} 
                 onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} />
                 
            {/* Coordinates Panel */}
            <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.7)", color: "white", padding: "10px", borderRadius: "5px", maxWidth: "250px" }}>
                <h3>Object Coordinates:</h3>
                {testTubePositions.map(({ id, position }) => (
                    <p key={id}>Test Tube: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
                ))}
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
    );
};

export default TestScene;