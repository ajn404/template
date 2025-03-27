'use client'

import { quitIfWebGPUNotAvailable } from '@/utils/gpu';
import {
    cubeVertexArray,
    cubeVertexSize,
    cubeUVOffset,
    cubePositionOffset,
    cubeVertexCount,
} from './cube';
import basicVertWGSL from '@/utils/shaders/basic.vert.wgsl';
import vertexPositionColorWGSL from '@/utils/shaders/vertexPositionColor.frag.wgsl';
import React from 'react';


export default function RotatingCube() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const resources = React.useRef<{
        context?: GPUCanvasContext;
        device?: GPUDevice
    }>({});

    const cleanupResources = () => {

    }

    React.useEffect(() => {
        const initWebGPU = async () => {

            if (!canvasRef.current) {
                return;
            }
            const canvas = canvasRef.current;
            if (!canvas) return;
            const adapter = await navigator.gpu.requestAdapter();
            resources.current.device = await adapter?.requestDevice();
            quitIfWebGPUNotAvailable(adapter, resources.current.device);
            if (!resources.current.device) return;

            // 上下文配置
            resources.current.context = canvas.getContext('webgpu') as GPUCanvasContext;
            const presentationFormat = navigator.gpu.getPreferredCanvasFormat(); // 获取当前设备的颜色格式
            resources.current.context.configure({
                device: resources.current.device,
                format: presentationFormat,
            });

            // 创建缓冲区
            const vertexBuffer = resources.current.device.createBuffer({
                size: cubeVertexArray.byteLength,
                usage: GPUBufferUsage.VERTEX,
                mappedAtCreation: true,
            })

            // 将顶点数据写入缓冲区
            new Float32Array(vertexBuffer.getMappedRange()).set(cubeVertexArray);


        }


        return () => {
            cleanupResources();
        }
    }, [])

    return (
        <div className="w-full h-screen">
            <canvas
                ref={canvasRef}
                className="h-[90%] w-[90%] m-auto bg-transparent"
                style={{
                    minWidth: '100px',
                    minHeight: '100px',
                    background: 'transparent'
                }}
            />
        </div>
    )
}