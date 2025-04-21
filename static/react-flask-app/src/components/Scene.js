import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
// import download from "downloadjs"; // Make sure to import the library

const Scene = () => {
    const [testTubePositions, setTestTubePositions] = useState([]);
const [valvePositions, setValvePositions] = useState([]);
const [pumpPositions, setPumpPositions] = useState([]);
const [pipePositions, setPipePositions] = useState([]);
const [draggingItem, setDraggingItem] = useState(null);
const [error, setError] = useState("");
const [smallxpipePositions, setSmallXPipePositions] = useState([]);
const [smallypipePositions, setSmallYPipePositions] = useState([]);
const [medypipePositions, setMedYPipePositions] = useState([]);
const [lrgypipePositions, setLrgYPipePositions] = useState([]);
const [medxpipePositions, setMedXPipePositions] = useState([]);
const [lrgxpipePositions, setLrgXPipePositions] = useState([]);
const [isCameraMovable, setIsCameraMovable] = useState(false);




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


    const handleSaveFile = async (e) => {
        e.preventDefault();
        try {
            // Create a serializable object from state
            const sceneData = {
                testTubes: testTubePositions,
                valves: valvePositions,
                pumps: pumpPositions,
                pipes: pipePositions,
            };

            // Download the JSON
            // download(JSON.stringify(sceneData, null, 2), "scene.json", "application/json");

            // Send to server (fixed fetch logic
            const response = await fetch("http://127.0.0.1:5000/scenejson_request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sceneData),
            });

            if (response.ok) alert("BRUHHH");
        } catch (error) {
            setError("Unexpected Error");
            console.error("Unexpected Error", error);
        }
    };

            
    

    useEffect(() => {
      const controls = orbitControlsRef.current;
      const camera = cameraRef.current;
    
      if (!controls || !camera) return;
    
      // Enable or disable camera movement
      controls.enableRotate = isCameraMovable;
      controls.enablePan = isCameraMovable;
      controls.enableZoom = isCameraMovable;
    
      // Reset to Bird’s Eye view when locking
      if (!isCameraMovable) {
        camera.position.set(0, 10, 0);       // directly above the grid
        camera.up.set(0, 0, -1);             // make Z axis point up in view
        camera.lookAt(0, 0, 0);              // look at the center
        controls.update();
      }
    }, [isCameraMovable]);
    

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
        camera.position.set(0, 10, 0); // Above the grid
        camera.up.set(0, 0, -1);       // Ensure Z is "up" in the view
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
        orbitControls.enableRotate = isCameraMovable;
        orbitControls.enablePan = isCameraMovable;
        orbitControls.enableZoom = isCameraMovable;
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



              }else if (object.name.includes("testTube")) {
                // Update test tube position state
                setTestTubePositions(prev => 
                    prev.map(item => 
                        item.id === object.userData.id ? 
                        { ...item, position: { ...object.position }} : item
                    )
                );
            }
            // Add handlers for other object types as needed
          }});

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
    const createDragHandle = (parentObject, position, size = 0.5) => {
        // Create an invisible box as a drag handle
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.0  // Invisible by default, can be made visible for debugging
        });
        
        const handle = new THREE.Mesh(geometry, material);
        handle.position.set(position.x-0.1, position.y + size/2, position.z);
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
            object = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 2, 32),
                new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7, shininess: 100 })
            );
            setTestTubePositions((prev) => [
                ...prev,
                { id, position: { x: position.x, y: yPosition, z: position.z } },
            ]);
        } else if (type === "valve") {
            // Load the OBJ file (geometry only)
            const objLoader = new OBJLoader();
        
            objLoader.load('bronze valve.obj', (obj) => {
                
                obj.traverse((child) => {

                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                       
                        // Apply the custom texture manually
                        child.material = new THREE.MeshStandardMaterial({
                           
                            roughness: 1,
                            metalness: 0.5
                        });
                    }
                });
        
               
                obj.position.set(position.x, 0, position.z);
                obj.scale.set(33, 21, 40);
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
                       obj.rotation.y = Math.PI; // 180 degrees

                        // Optional: If you want to override the texture manually
                        const textureLoader = new THREE.TextureLoader();
                        textureLoader.load('pump_Mixed_AO.png', (texture) => {
                            obj.traverse((child) => {
                                if (child.isMesh) {
                                    child.material.map = texture; // Apply texture
                                    child.material.needsUpdate = true; // Ensure material updates with the texture
                                }
                            });
    
                            // Position and scale the object
                            obj.position.set(position.x, position.y , position.z);
                            obj.scale.set(0.005,0.005,0.005); // Adjust scale as needed
                            sceneRef.current.add(obj);
                            objectsRef.current.push(obj);
                            obj.name = `pump-${id}`;
                            obj.userData = { id, type: "pump" };
                            const handle = createDragHandle(obj, obj.position);

                            pumpToHandleMap.current.set(obj.uuid, handle);

                            console.log('Pump model loaded and textured:', obj);
    
                            // Update state to track pump positions
                            setPumpPositions((prev) => [
                                ...prev,
                                { id, position: { x: position.x, y: yPosition, z: position.z } },
                            ]);
                        },
                        undefined,
                        (error) => console.error("Error loading texture:", error)
                    );
                },
                undefined,
                (error) => console.error("Error loading pump model:", error)
            );
            return;
            })}
        else if (type === "smally-pipe") {
            const loader = new GLTFLoader();
            loader.load(
                "/finalsmall.glb",
                (gltf) => {
                  
                    const pipe = gltf.scene;
                    const obj = pipe;
                    obj.position.set(position.x-0.1, position.y, position.z);
                    obj.scale.set(0.009, 0.022, 0.012);
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
                        { id, position: { x: position.x-0.1, y: position.y, z: position.z } },
                    ]);
                }
            );
        
        
            return;
        }
        else if (type === "medy-pipe") {
            const loader = new GLTFLoader();
            loader.load(
              "/finalmed.glb",
              (gltf) => {
                  const pipe = gltf.scene;
                  const obj = pipe;
                  pipe.position.set(position.x, position.y, position.z);
                  pipe.scale.set(0.0042, 0.0025, 0.0025);
                    
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
              "/finallrg.glb",
                (gltf) => {
                  
                    const pipe = gltf.scene;
                    const obj = pipe;
                    pipe.position.set(position.x, yPosition, position.z);
                    pipe.scale.set(0.0035, 0.002, 0.0035);
                    
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
       
            
            else if (type === "smallx-pipe") {
                const loader = new GLTFLoader();
                loader.load(
                  "/finalsmall.glb",
                  (gltf) => {
                   

                      const pipe = gltf.scene;
                      const obj = pipe;
                      obj.position.set(position.x-0.1, position.y, position.z);
                      obj.scale.set(0.009, 0.022, 0.015);
                        obj.name = `smallxpipe-${id}`;
                        obj.userData = { id, type: "smallxpipe" };
                        pipe.rotation.y = Math.PI ;

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
                "/finalmed.glb",
                (gltf) => {
                    const pipe = gltf.scene;
                    const obj = pipe;
                    pipe.position.set(position.x, position.y, position.z);
                    pipe.scale.set(0.0042, 0.0025, 0.0025);
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
                        { id, position: { x: position.x+0.1, y: yPosition, z: position.z } },
                    ]);               
        
                    sceneRef.current.add(pipe);
                    objectsRef.current.push(pipe);
                    
                }
            );
    
        return;
    }else if (type === "lrgx-pipe") {
        const loader = new GLTFLoader();
        loader.load(
            "/finallrg.glb",
            (gltf) => {
                const pipe = gltf.scene;
                const obj = pipe;
                pipe.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.userData = { id, type: "lrgxpipe" }; // Make sure mesh gets the data
                    }
                });
                pipe.position.set(position.x, yPosition, position.z);
                pipe.scale.set(0.0035, 0.002, 0.0035);
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
                    { id, position: { x: position.x-0.1, y: yPosition, z: position.z } },
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

   
    

    
    return (
      
        <div style={{ display: "flex", width: "100vw", height: "100vh", }}>
  {/* Sidebar */}
  <div style={{ width: "150px", background: "#222", backgroundColor:"black", opacity:0.8, padding: "10px", color: "white" }}>
    <p>Drag objects:</p>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "space-between",
      }}
    >
    <div
  draggable
  onDragStart={(e) => {
    setDraggingItem("valve");

    const img = new Image();
    img.src = "/Screenshot 2025-04-18 at 2,17,07 PM-Picsart-BackgroundRemover.png"; // Ensure correct path to image
    img.onload = () => {
      e.dataTransfer.setDragImage(img, 40, 40); // Set drag preview
    };
  }}
  style={{
    cursor: 'grab',
    width: '70px',
    height: '80px',
  }}
>
  <img
    src="/Screenshot 2025-04-18 at 2,17,07 PM-Picsart-BackgroundRemover.png" // Directly use the image in the div
    alt="Valve thumbnail"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain', // Ensures the image fits without distortion
    }}
  />
</div>
<div
  draggable
  onDragStart={(e) => {
    setDraggingItem("pump");

    const img = new Image();
    img.src = "/Screenshot 2025-04-18 at 2,23,49 PM-Picsart-BackgroundRemover.png"; // Ensure correct path to image
    img.onload = () => {
      e.dataTransfer.setDragImage(img, 40, 40); // Set drag preview
    };
  }}
  style={{
    cursor: 'grab',
    width: '70px',
    height: '80px',
  }}
>
  <img
    src="/Screenshot 2025-04-18 at 2,23,49 PM-Picsart-BackgroundRemover.png" // Directly use the image in the div
    alt="Valve thumbnail"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain', // Ensures the image fits without distortion
    }}
  />
</div>
                {/* <div draggable onDragStart={() => setDraggingItem("x-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     x-Pipe
                </div> */}
                {/* <div draggable onDragStart={() => setDraggingItem("y-pipe")} 
                     style={{ width: "50px", height: "50px", background: "#888", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>
                     y-Pipe
                </div> */}
              

                <div
  draggable
  onDragStart={(e) => {
    setDraggingItem("smallx-pipe");

    const img = new Image();
    img.src = "/Screenshot 2025-04-18 at 1,57,12 PM-Picsart-BackgroundRemover.png"; // Ensure correct path to image
    img.onload = () => {
      e.dataTransfer.setDragImage(img, 40, 40); // Set drag preview
    };
  }}
  style={{
    cursor: 'grab',
    width: '70px',
    height: '80px',
  }}
>
  <img
    src="/Screenshot 2025-04-18 at 1,57,12 PM-Picsart-BackgroundRemover.png" // Directly use the image in the div
    alt="Pipe thumbnail"
    style={{
      width: '100%',
      height: '100%',
      transform: 'rotate(90deg)',

      objectFit: 'contain', // Ensures the image fits without distortion
    }}
  />
</div>

<div
  draggable
  onDragStart={(e) => {
    setDraggingItem("medx-pipe");

    const img = new Image();
    img.src = "/Screenshot 2025-04-18 at 2,34,36 PM-Picsart-BackgroundRemover.png"; 
    img.onload = () => {
      e.dataTransfer.setDragImage(img, 40, 40);
    };
  }}
  style={{
    cursor: 'grab',
    width: '70px',
    height: '80px',
  }}
>
  <img
    src="/Screenshot 2025-04-18 at 2,34,36 PM-Picsart-BackgroundRemover.png" 
    alt="Valve thumbnail"
    style={{
      width: '100%',
      height: '100%',
      transform: 'rotate(90deg)',

      objectFit: 'contain', 
    }}
  />
</div>
<div
  draggable
  onDragStart={(e) => {
    setDraggingItem("lrgx-pipe");

    const img = new Image();
    img.src = "/Screenshot 2025-04-19 at 2,11,40 PM-Picsart-BackgroundRemover.png"; 
    img.onload = () => {
      e.dataTransfer.setDragImage(img, 40, 40); 
    };
  }}
  style={{
    cursor: 'grab',
    width: '70px',
    height: '80px',
  }}
>
  <img
    src="/Screenshot 2025-04-19 at 2,11,40 PM-Picsart-BackgroundRemover.png"// Directly use the image in the div
    alt="Pipe thumbnail"
    style={{
      width: '100%',
      height: '100%',
      transform: 'rotate(90deg)',
      objectFit: 'contain', // Ensures the image fits without distortion
    }}
  />
</div>

<div
  draggable
  onDragStart={(e) => {
    setDraggingItem("smally-pipe");

    const img = new Image();
    img.src = "/Screenshot 2025-04-18 at 1,57,12 PM-Picsart-BackgroundRemover.png"; // Ensure correct path to image
    img.onload = () => {
      e.dataTransfer.setDragImage(img, 40, 40); // Set drag preview
    };
  }}
  style={{
    cursor: 'grab',
    width: '70px',
    height: '80px',
  }}
>
  <img
    src="/Screenshot 2025-04-18 at 1,57,12 PM-Picsart-BackgroundRemover.png" // Directly use the image in the div
    alt="Pipe thumbnail"
    style={{
      width: '100%',
      
      transform: 'rotate(-90deg)',

      height: '100%',
      objectFit: 'contain', // Ensures the image fits without distortion
    }}
  />
</div>

                <div
  draggable
  onDragStart={(e) => {
    setDraggingItem("medy-pipe");

    const img = new Image();
    img.src = "/Screenshot 2025-04-18 at 2,34,36 PM-Picsart-BackgroundRemover.png"; // Ensure correct path to image
    img.onload = () => {
      e.dataTransfer.setDragImage(img, 40, 40); // Set drag preview
    };
  }}
  style={{
    cursor: 'grab',
    width: '70px',
    height: '80px',
  }}
>
  <img
    src="/Screenshot 2025-04-18 at 2,34,36 PM-Picsart-BackgroundRemover.png" // Directly use the image in the div
    alt="Valve thumbnail"
    style={{
      width: '100%',
      height: '100%',

      objectFit: 'contain', // Ensures the image fits without distortion
    }}
  />
</div>
                <div
  draggable
  onDragStart={(e) => {
    setDraggingItem("lrgy-pipe");

    const img = new Image();
    img.src = "/Screenshot 2025-04-19 at 2,11,40 PM-Picsart-BackgroundRemover.png";
    img.onload = () => {
      e.dataTransfer.setDragImage(img, 40, 40);
    };
  }}
  style={{
    cursor: 'grab',
    width: '70px',
    height: '80px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <img
    src="/Screenshot 2025-04-19 at 2,11,40 PM-Picsart-BackgroundRemover.png"
    alt="Pipe thumbnail"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      transformOrigin: 'center',
    }}
  />
</div>
</div>


                <div style={{ position: "absolute", top: 10, left: 180, color: "white", fontSize: "14px" }}>
                    <button onClick={handleSaveFile}>Save File</button>
                    <button onClick={() => setIsCameraMovable(prev => !prev)}>
  {isCameraMovable ? "Lock Camera" : "Move Camera"}
</button>
    {/* <h3>Object Coordinates:</h3>
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
    ))} */}
</div>

            </div>
            {/* Scene Container */}
            <div ref={mountRef} style={{ flex: 1, overflow: "hidden" }} 
                 onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} />
        </div>
    );
};

export default Scene;
