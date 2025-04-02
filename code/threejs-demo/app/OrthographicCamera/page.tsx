"use client"; // 必须标记为客户端组件
import { useEffect, useRef } from "react";
import * as THREE from "three";
// 示例：添加 OrbitControls
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function ThreeScene() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // 场景、相机、渲染器
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            canvasRef.current.width / -2,
            canvasRef.current.width / 2,
            canvasRef.current.height / 2,
            canvasRef.current.height / -2,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // 设置相机初始位置
        camera.position.set(200, 200, 200);
        camera.lookAt(0, 0, 0);

        // 添加立方体
        const geometry = new THREE.BoxGeometry(100, 100, 100);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        controls.update();

        // 动画循环
        const animate = () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        animate();

        // 清理函数
        return () => {
            renderer.dispose();
            geometry.dispose();
            material.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function Page() {
    return <ThreeScene />;
}