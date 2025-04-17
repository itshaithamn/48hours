import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';


const Scene = () => {
    const [testTubePositions, setTestTubePositions] = useState([]);
const [valvePositions, setValvePositions] = useState([]);
const [pumpPositions, setPumpPositions] = useState([]);
const [pipePositions, setPipePositions] = useState([]);
const [smallxpipePositions, setSmallXPipePositions] = useState([]);
const [smallypipePositions, setSmallYPipePositions] = useState([]);
const [medypipePositions, setMedYPipePositions] = useState([]);
const [lrgypipePositions, setLrgYPipePositions] = useState([]);
const [medxpipePositions, setMedXPipePositions] = useState([]);
const [lrgxpipePositions, setLrgXPipePositions] = useState([]);




    const mountRef = useRef(null);
    const controlsRef = useRef(null);
    const objectsRef = useRef([]);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const orbitControlsRef = useRef(null);
    const pumpToHandleMap = useRef(new Map());
    const valveToHandleMap=useRef(new Map());
    const smallxpipeToHandleMap=useRef(new Map());
    const smallypipeToHandleMap=useRef(new Map());
    const medxpipeToHandleMap=useRef(new Map());
    const medypipeToHandleMap=useRef(new Map());
    const lrgxpipeToHandleMap=useRef(new Map());
    const lrgypipeToHandleMap=useRef(new Map());






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
            valveToHandleMap.current.clear();
            smallxpipeToHandleMap.current.clear();
            smallypipeToHandleMap.current.clear();
            medxpipeToHandleMap.current.clear();
            medypipeToHandleMap.current.clear();
            lrgxpipeToHandleMap.current.clear();
            lrgypipeToHandleMap.current.clear();


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
       // Setup Drag Controls
       const dragControls = new DragControls(objectsRef.current, camera, renderer.domElement);
       controlsRef.current = dragControls;

       // Handle drag control events
       dragControls.addEventListener("drag", (event) => {
           const object = event.object;
           
           // Define the grid boundaries
           const minX = -5, maxX = 5;
           const minZ = -5, maxZ = 5;
           object.position.y=0
           // Constrain the object's position within the grid
           object.position.x = Math.max(minX, Math.min(maxX, object.position.x));
           object.position.z = Math.max(minZ, Math.min(maxZ, object.position.z));
           // If this is a pump handle, move the associated pump
           if (object.userData?.isPumpHandle|| object.userData?.isValveHandle ||object.userData?.isSmallXpipeHandle||object.userData?.isSmallYpipeHandle||object.userData?.isMedXpipeHandle||object.userData?.isMedYpipeHandle||object.userData?.isLrgXpipeHandle||object.userData?.isLrgYpipeHandle) {
               const pumpModel = object.userData.pumpModel;
               const smallxpipeModel=object.userData.smallxpipeModel;
               const smallypipeModel=object.userData.smallypipeModel;
               const medxpipeModel=object.userData.medxpipeModel;
               const medypipeModel=object.userData.medypipeModel;
               const lrgxpipeModel=object.userData.lrgxpipeModel;
               const lrgypipeModel=object.userData.lrgypipeModel;
               const handle = event.object;

               const valveModel=object.userData.valveModel;
               if (pumpModel) {
                   pumpModel.position.x = object.position.x;
                   pumpModel.position.z = object.position.z;
                   handle.position.x = Math.floor(handle.position.x) + 0.5;
                   handle.position.z = Math.floor(handle.position.z) + 0.5;
                   handle.position.x = Math.max(-5, Math.min(5, handle.position.x));
                   handle.position.z = Math.max(-5, Math.min(5, handle.position.z));
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
                   if (valveModel) {
                    valveModel.position.x = object.position.x;
                    valveModel.position.z = object.position.z;
                    handle.position.x = Math.floor(handle.position.x) + 0.5;
                   handle.position.z = Math.floor(handle.position.z) + 0.5;
                   handle.position.x = Math.max(-5, Math.min(5, handle.position.x));
                   handle.position.z = Math.max(-5, Math.min(5, handle.position.z));
                    // Update state for pump positions
                    setValvePositions(prev => 
                        prev.map(item => 
                            item.id === valveModel.userData.id ? 
                            { ...item, position: { 
                                x: object.position.x, 
                                y: valveModel.position.y, 
                                z: object.position.z 
                            }} : item
                        )
                    );}
                    if (smallxpipeModel) {
                        smallxpipeModel.position.x = object.position.x;
                        smallxpipeModel.position.z = object.position.z;
                        smallxpipeModel.position.y=0.25;
                        handle.position.x = Math.floor(handle.position.x) + 0.5;
                   handle.position.z = Math.floor(handle.position.z) + 0.5;
                   handle.position.x = Math.max(-5, Math.min(5, handle.position.x));
                   handle.position.z = Math.max(-5, Math.min(5, handle.position.z));
                        // Update state for pump positions
                        setSmallXPipePositions(prev => 
                            prev.map(item => 
                                item.id === smallxpipeModel.userData.id ? 
                                { ...item, position: { 
                                    x: object.position.x, 
                                    y: smallxpipeModel.position.y, 
                                    z: object.position.z 
                                }} : item
                            )
                        );}
                        if (medxpipeModel) {
                            handle.position.x = Math.floor(handle.position.x) + 0.5;
                   handle.position.z = Math.floor(handle.position.z) + 0.5;
                   handle.position.x = Math.max(-5, Math.min(5, handle.position.x));
                   handle.position.z = Math.max(-5, Math.min(5, handle.position.z));
                            medxpipeModel.position.x = object.position.x;
                            medxpipeModel.position.z = object.position.z;
                            medxpipeModel.position.y=0.25;
                            // Update state for pump positions
                            setMedXPipePositions(prev => 
                                prev.map(item => 
                                    item.id === medxpipeModel.userData.id ? 
                                    { ...item, position: { 
                                        x: object.position.x, 
                                        y: medxpipeModel.position.y, 
                                        z: object.position.z 
                                    }} : item
                                )
                            );}
                            if (lrgxpipeModel) {
                                lrgxpipeModel.position.x = object.position.x;
                                lrgxpipeModel.position.z = object.position.z;
                                handle.position.x = Math.floor(handle.position.x) + 0.5;
                   handle.position.z = Math.floor(handle.position.z) + 0.5;
                   handle.position.x = Math.max(-5, Math.min(5, handle.position.x));
                                lrgxpipeModel.position.y=0.25;
                                // Update state for pump positions
                                setLrgXPipePositions(prev => 
                                    prev.map(item => 
                                        item.id === lrgxpipeModel.userData.id ? 
                                        { ...item, position: { 
                                            x: object.position.x, 
                                            y: lrgxpipeModel.position.y, 
                                            z: object.position.z 
                                        }} : item
                                    )
                                );}
                        if (smallypipeModel) {
                            smallypipeModel.position.x = object.position.x;
                            smallypipeModel.position.z = object.position.z;
                            handle.position.x = Math.floor(handle.position.x) + 0.5;
                   handle.position.z = Math.floor(handle.position.z) + 0.5;
                   handle.position.x = Math.max(-5, Math.min(5, handle.position.x));
                            // Update state for pump positions
                            setSmallYPipePositions(prev => 
                                prev.map(item => 
                                    item.id === smallypipeModel.userData.id ? 
                                    { ...item, position: { 
                                        x: object.position.x, 
                                        y: valveModel.position.y, 
                                        z: object.position.z 
                                    }} : item
                                )
                            );}
                            if (medypipeModel) {
                                medypipeModel.position.x = object.position.x;
                                medypipeModel.position.z = object.position.z;
                                handle.position.x = Math.floor(handle.position.x) + 0.5;
                   handle.position.z = Math.floor(handle.position.z) + 0.5;
                   handle.position.x = Math.max(-5, Math.min(5, handle.position.x));
                                medypipeModel.position.y=0.25;
                                // Update state for pump positions
                                setMedYPipePositions(prev => 
                                    prev.map(item => 
                                        item.id === medypipeModel.userData.id ? 
                                        { ...item, position: { 
                                            x: object.position.x, 
                                            y: medypipeModel.position.y, 
                                            z: object.position.z 
                                        }} : item
                                    )
                                );}
                                if (lrgypipeModel) {
                                    lrgypipeModel.position.x = object.position.x;
                                    lrgypipeModel.position.z = object.position.z;
                                    handle.position.x = Math.floor(handle.position.x) + 0.5;
                   handle.position.z = Math.floor(handle.position.z) + 0.5;
                   handle.position.x = Math.max(-5, Math.min(5, handle.position.x));
                                    lrgypipeModel.position.y=0.25;
                                    // Update state for pump positions
                                    setLrgXPipePositions(prev => 
                                        prev.map(item => 
                                            item.id === lrgypipeModel.userData.id ? 
                                            { ...item, position: { 
                                                x: object.position.x, 
                                                y: lrgypipeModel.position.y, 
                                                z: object.position.z 
                                            }} : item
                                        )
                                    );}
    
                   

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
            isValveHandle:true,
            isSmallXpipeHandle:true,
            isSmallYpipeHandle:true,
            isMedXpipeHandle: true,
            isMedYpipeHandle:true,
            isLrgXpipeHandle:true,
            isLrgYpipeHandle: true,
            valveModel:parentObject,
            smallxpipeModel: parentObject,
            smallypipeModel: parentObject,
            medxpipeModel: parentObject,
            medypipe: parentObject,
            lrgypipeModel: parentObject,
            lrgxpipeModel: parentObject,




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
        let object;
        const yPosition = 0;
        const id = Date.now(); // Generate a unique ID for each object
    
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
        
        } else if (type === "valve") {
            const mtlLoader = new MTLLoader();
            const textureLoader = new THREE.TextureLoader();
            const customTexture = textureLoader.load('Bronze valve_DefaultMaterial_Roughness.png');
        
            const objLoader = new OBJLoader();
        
            objLoader.load('newvalve.obj', (obj) => {
                
                obj.traverse((child) => {

                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                       
                        // Apply the custom texture manually
                        child.material = new THREE.MeshStandardMaterial({
                            map: customTexture,
                            roughness: 1,
                            metalness: 0.5
                        });
                    }
                });
        
                obj.rotation.y = Math.PI;
                obj.position.set(position.x, 0, position.z);
                obj.scale.set(0.005, 0.005, 0.005);
                obj.name = `valve-${id}`;
                obj.userData = { id, type: "valve" };
        
                sceneRef.current.add(obj);
        
                const handle = createDragHandle(obj, obj.position);
                valveToHandleMap.current.set(obj.uuid, handle);
        
                setValvePositions((prev) => [...prev, {
                    id,
                    position: {
                        x: obj.position.x,
                        y: obj.position.y,
                        z: obj.position.z
                    }
                }]);
        
            }, undefined, (error) => {
                console.error("Error loading valve model:", error);
            });
                
        
        } else if (type === "pump") {
            const mtlLoader = new MTLLoader();
            mtlLoader.load('newpump2.mtl', (materials) => {
                materials.preload();
            
                const objLoader = new OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load(
                    'newpump2.obj',
                    (obj) => {
                       obj.rotation.x = Math.PI; // 180 degrees

                        // Optional: If you want to override the texture manually
                        const textureLoader = new THREE.TextureLoader();
                        textureLoader.load('pump_Mixed_AO.png', (texture) => {
                            obj.traverse((child) => {
                                if (child.isMesh) {
                                    child.material.map = texture;
                                    child.material.needsUpdate = true;
                                }
                            });
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
    
       
        }else if (type === "y-pipe") {
            const loader = new GLTFLoader();
            loader.load(
                "/uploads-files-2241660-pipes.glb",
                (gltf) => {
                    const pipe = gltf.scene;
                    pipe.position.set(position.x, yPosition, position.z);
                    pipe.scale.set(0.002, 0.002, 0.002);
                    
                    // Rotate the pipe 90 degrees on the x-axis
                    pipe.rotation.y = Math.PI / 2;
        
                    sceneRef.current.add(pipe);
                    objectsRef.current.push(pipe);
                    setPipePositions((prev) => [
                        ...prev,
                        { id, position: { x: position.x, y: yPosition, z: position.z } },
                    ]);
                }
            );
        
        
            return;
        }
        else if (type === "smally-pipe") {
            const loader = new GLTFLoader();
            loader.load(
                "/smallpipe.glb",
                (gltf) => {
                    const pipe = gltf.scene;
                    const obj = pipe;
                    obj.position.set(position.x, position.y, position.z);
                    obj.scale.set(0.002, 0.002, 0.002);
                    obj.name = `smallypipe-${id}`;
                    obj.userData = { id, type: "smallypipe" };
                    
                    // Add to scene but NOT to draggable objects
                    sceneRef.current.add(obj);
                    
                    // Create a drag handle for the pump
                    const handle = createDragHandle(obj, obj.position);
                    
                    // Store the reference in our map
                   smallypipeToHandleMap.current.set(obj.uuid, handle);
                    
                    sceneRef.current.add(pipe);
                    objectsRef.current.push(pipe);
                    setSmallYPipePositions((prev) => [
                        ...prev,
                        { id, position: { x: position.x, y: position.y, z: position.z } },
                    ]);
                }
            );
        
        
            return;
        }
        else if (type === "medy-pipe") {
            const loader = new GLTFLoader();
            loader.load(
                "/mediumpipe.glb",
                (gltf) => {
                    const pipe = gltf.scene;
                    const obj = pipe;
                    pipe.position.set(position.x, yPosition, position.z);
                    pipe.scale.set(0.002, 0.002, 0.002);
                    
                    // Rotate the pipe 90 degrees on the x-axis
                    pipe.rotation.y = Math.PI / 2;
                    obj.name = `medypipe-${id}`;
                    obj.userData = { id, type: "medypipe" };
                    
                    // Add to scene but NOT to draggable objects
                    sceneRef.current.add(obj);
                    
                    // Create a drag handle for the pump
                    const handle = createDragHandle(obj, obj.position);
                    
                    // Store the reference in our map
                    medypipeToHandleMap.current.set(obj.uuid, handle);
                    
                    sceneRef.current.add(pipe);
                    objectsRef.current.push(pipe);
                    setMedYPipePositions((prev) => [
                        ...prev,
                        { id, position: { x: position.x, y: yPosition, z: position.z } },
                    ]);
                }
            );
        
        
            return;
        }

        else if (type === "lrgy-pipe") {
            const loader = new GLTFLoader();
            loader.load(
                "/largepipe.glb",
                (gltf) => {
                  
                    const pipe = gltf.scene;
                    const obj = pipe;
                    pipe.position.set(position.x, yPosition, position.z);
                    pipe.scale.set(0.002, 0.002, 0.002);
                    
                    // Rotate the pipe 90 degrees on the x-axis
                    pipe.rotation.y = Math.PI / 2;
                    obj.name = `lrgypipe-${id}`;
                    obj.userData = { id, type: "lrgypipe" };
                    
                    // Add to scene but NOT to draggable objects
                    sceneRef.current.add(obj);
                    
                    // Create a drag handle for the pump
                    const handle = createDragHandle(obj, obj.position);
                    
                    // Store the reference in our map
                    lrgypipeToHandleMap.current.set(obj.uuid, handle);
                    
                    sceneRef.current.add(pipe);
                    objectsRef.current.push(pipe);
                    setLrgYPipePositions((prev) => [
                        ...prev,
                        { id, position: { x: position.x, y: yPosition, z: position.z } },
                    ]);
                }
            );
        
        
            return;
        }
        else if (type === "x-pipe") {
            const loader = new GLTFLoader();
            loader.load(
                "/uploads-files-2241660-pipes.glb",
                (gltf) => {
                   
                    const pipe = gltf.scene;
                    
                    pipe.position.set(position.x, yPosition, position.z);
                    pipe.scale.set(0.002, 0.002, 0.002);
                    
                    // Rotate the pipe 90 degrees on the x-axis
                  
        
                    sceneRef.current.add(pipe);
                    objectsRef.current.push(pipe);
                    
                }
            );}
            else if (type === "smallx-pipe") {
                const loader = new GLTFLoader();
                loader.load(
                    "/smallpipe.glb",
                    (gltf) => {
                        
                        const pipe = gltf.scene;
                        const obj = pipe;
                        pipe.position.set(position.x, 0, position.z);
                        pipe.scale.set(0.002, 0.002, 0.002);
                        obj.name = `smallxpipe-${id}`;
                        obj.userData = { id, type: "smallxpipe" };
                        
                        // Add to scene but NOT to draggable objects
                        sceneRef.current.add(obj);
                        
                        // Create a drag handle for the pump
                        const handle = createDragHandle(obj, obj.position);
                        
                        // Store the reference in our map
                        smallxpipeToHandleMap.current.set(obj.uuid, handle);
                        
                        setSmallXPipePositions((prev) => [
                            ...prev,
                            { id, position: { x: position.x, y: yPosition, z: position.z } },
                        ]);               
            
                        sceneRef.current.add(pipe);
                        objectsRef.current.push(pipe);
                        
                    }
                );
        
            return;
        } else if (type === "medx-pipe") {
            const loader = new GLTFLoader();
            loader.load(
                "/mediumpipe.glb",
                (gltf) => {
                    const pipe = gltf.scene;
                    const obj = pipe;
                    pipe.position.set(position.x, position.y, position.z);
                    pipe.scale.set(0.002, 0.002, 0.002);
                    obj.name = `medxpipe-${id}`;
                    obj.userData = { id, type: "medxpipe" };
                    
                    // Add to scene but NOT to draggable objects
                    sceneRef.current.add(obj);
                    
                    // Create a drag handle for the pump
                    const handle = createDragHandle(obj, obj.position);
                    
                    // Store the reference in our map
                    medxpipeToHandleMap.current.set(obj.uuid, handle);
                    
                    setMedXPipePositions((prev) => [
                        ...prev,
                        { id, position: { x: position.x, y: yPosition, z: position.z } },
                    ]);               
        
                    sceneRef.current.add(pipe);
                    objectsRef.current.push(pipe);
                    
                }
            );
    
        return;
    }else if (type === "lrgx-pipe") {
        const loader = new GLTFLoader();
        loader.load(
            "/largepipe.glb",
            (gltf) => {
                const pipe = gltf.scene;
                const obj = pipe;
                pipe.position.set(position.x, yPosition, position.z);
                pipe.scale.set(0.002, 0.002, 0.002);
                obj.name = `lrgxpipe-${id}`;
                obj.userData = { id, type: "lrgxpipe" };
                
                // Add to scene but NOT to draggable objects
                sceneRef.current.add(obj);
                
                // Create a drag handle for the pump
                const handle = createDragHandle(obj, obj.position);
                
                // Store the reference in our map
                lrgxpipeToHandleMap.current.set(obj.uuid, handle);
                
                setLrgXPipePositions((prev) => [
                    ...prev,
                    { id, position: { x: position.x, y: yPosition, z: position.z } },
                ]);               
    
                sceneRef.current.add(pipe);
                objectsRef.current.push(pipe);
                
            }
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
    
        
    

// useEffect(() => {
//     if (!sceneRef.current) return;

//    const dragControls = new DragControls(objectsRef.current, cameraRef.current, rendererRef.current.domElement);

//     dragControls.addEventListener("dragstart", () => { orbitControlsRef.current.enabled = false; });
//     dragControls.addEventListener("dragend", () => { orbitControlsRef.current.enabled = true; });

//     dragControls.addEventListener("drag", (event) => {
//         if (event.object) {
//             // Constrain y position to 0 and update position
//             event.object.position.y = 0;
//             updateObjectPosition(event.object, event.object.position);
//         }
//     });

//     return () => {
//         dragControls.dispose();
//     };
// }, []);

    
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
                <div draggable onDragStart={() => setDraggingItem("x-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     x-Pipe
                </div>
                <div draggable onDragStart={() => setDraggingItem("y-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     y-Pipe
                </div>
                <div draggable onDragStart={() => setDraggingItem("smallx-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     smallx
                </div>
                <div draggable onDragStart={() => setDraggingItem("medx-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     medx
                </div>
                <div draggable onDragStart={() => setDraggingItem("lrgx-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     lrgx
                </div>
                <div draggable onDragStart={() => setDraggingItem("smally-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     smally
                </div>
                <div draggable onDragStart={() => setDraggingItem("medy-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     medy
                </div>
                <div draggable onDragStart={() => setDraggingItem("lrgy-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     lrgy
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
     {smallxpipePositions.map(({ id, position }) => (
        <p key={id}>SmallXPipe: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    ))}
     {medxpipePositions.map(({ id, position }) => (
        <p key={id}>MedXPipe: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    ))}
     {lrgxpipePositions.map(({ id, position }) => (
        <p key={id}>LrgXPipe: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    ))}
     {smallypipePositions.map(({ id, position }) => (
        <p key={id}>SmallYPipe: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    ))}
     {medypipePositions.map(({ id, position }) => (
        <p key={id}>MedYPipe: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
    ))}
     {lrgypipePositions.map(({ id, position }) => (
        <p key={id}>LrgYPipe: ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})</p>
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
