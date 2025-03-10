"use client"; // 必须标记为客户端组件
import { useEffect, useRef } from "react";
import * as THREE from "three";
// 示例：添加 OrbitControls
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function ThreeScene() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (!canvasRef.current) return;

        // 场景、相机、渲染器
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(window.innerWidth, window.innerHeight);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // 添加立方体
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        camera.position.z = 5;
        controls.update();

        // 动画循环
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();


        return () => {
        };
    }, []);

    return <canvas ref={canvasRef}/>;
}