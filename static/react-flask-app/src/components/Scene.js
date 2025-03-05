import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import download from 'downloadjs'

const Scene = () => {
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

        if (sceneRef.current) {
            sceneRef.current.clear();
            objectsRef.current = [];
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0x555555);
        scene.add(gridHelper);

        const orbitControls = new OrbitControls(camera, renderer.domElement);
        orbitControls.enableDamping = true;
        orbitControls.dampingFactor = 0.05;
        orbitControls.minDistance = 3;
        orbitControls.maxDistance = 20;
        orbitControlsRef.current = orbitControls;

        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        if (controlsRef.current) controlsRef.current.dispose();
        const dragControls = new DragControls(objectsRef.current, camera, renderer.domElement);
        controlsRef.current = dragControls;

        dragControls.addEventListener("drag", (event) => {
            event.object.position.y = 1;
        });

        dragControls.addEventListener("dragend", (event) => {
            event.object.position.y = 1;
        });

        dragControls.addEventListener("dragstart", () => { orbitControls.enabled = false; });
        dragControls.addEventListener("dragend", () => { orbitControls.enabled = true; });

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
        };
        window.addEventListener("resize", handleResize);

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

    const addObjectToScene = (type, position) => {
        if (!sceneRef.current) return;
        let object;

        if (type === "testTube") {
            object = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 2, 32),
                new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.7, shininess: 100 })
            );
        } else if (type === "valve") {
            const cylinder = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 2, 32),
                new THREE.MeshPhongMaterial({ color: 0xff0000 })
            );

            const wheel = new THREE.Mesh(
                new THREE.TorusGeometry(0.5, 0.1, 16, 32),
                new THREE.MeshPhongMaterial({ color: 0xffffff })
            );
            wheel.rotation.x = Math.PI / 2;
            wheel.position.y = 1.1;

            const valveGroup = new THREE.Group();
            valveGroup.add(cylinder);
            valveGroup.add(wheel);
            wheel.position.set(0, 1.1, 0); // Ensuring it stays attached

            object = valveGroup;
        }

        if (object) {
            object.position.set(position.x, 1, position.z);
            sceneRef.current.add(object);
            objectsRef.current.push(object);
        }
    };

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

            const scenejsonRequest = new Request("http://127.0.0.1:5000/scenejson_request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: file,
            });

            post(scenejsonRequest);
        }
    }

    return (
        <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
            <div style={{ width: "150px", background: "#222", padding: "10px", color: "white" }}>
                <p>Drag objects:</p>
                <div draggable onDragStart={() => setDraggingItem("testTube")} style={{ width: "50px", height: "50px", background: "#0ff", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>Tube</div>
                <div draggable onDragStart={() => setDraggingItem("valve")} style={{ width: "50px", height: "50px", background: "#f00", cursor: "grab", textAlign: "center", lineHeight: "50px", borderRadius: "5px" }}>Valve</div>
                <button onClick={handleSaveFile}>Save File</button>
            </div>
            <div ref={mountRef} style={{ flex: 1, overflow: "hidden" }} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} />
        </div>
    );
};

export default Scene;
