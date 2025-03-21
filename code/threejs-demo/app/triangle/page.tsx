'use client'

import React, { useEffect } from 'react';
import { quitIfWebGPUNotAvailable } from "@/utils/gpu"

export default function Triangle() {
    const resources = React.useRef<{
        device?: GPUDevice;
        context?: GPUCanvasContext;
        adapter?: GPUAdapter|null;
        pipeline?: GPURenderPipeline;
        vertexBuffer?: GPUBuffer;
        animationFrameId?: number;
    }>({});

    useEffect(() => {
        const initWebGPU = async () => {
            try {
                const canvas = document.querySelector('canvas') as HTMLCanvasElement;
                
                // 1. 初始化适配器和设备
                resources.current.adapter = await navigator.gpu.requestAdapter();
                resources.current.device = await resources.current.adapter?.requestDevice();
                
                if (!resources.current.device) return;

                

                // 2. 配置Canvas上下文
                resources.current.context = canvas.getContext('webgpu') as GPUCanvasContext;
                const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
                resources.current.context.configure({
                    device: resources.current.device,
                    format: presentationFormat,
                    alphaMode: 'premultiplied',
                });

                // 3. 设置Canvas尺寸
                const devicePixelRatio = window.devicePixelRatio || 1;
                canvas.width = canvas.clientWidth * devicePixelRatio;
                canvas.height = canvas.clientHeight * devicePixelRatio;

                // 4. 创建GPU资源
                const { device } = resources.current;
                
                // 着色器模块
                const shaderModule = device.createShaderModule({
                    code: `
                        // 顶点着色器
                        @vertex
                        fn vertexMain(@location(0) position: vec2f) -> @builtin(position) vec4f {
                            return vec4f(position, 0.0, 1.0);
                        }
                        
                        // 片元着色器
                        @fragment
                        fn fragmentMain() -> @location(0) vec4f {
                            return vec4f(1.0, 0.0, 0.0, 1.0); // 红色
                        }
                    `
                });

                // 渲染管线
                resources.current.pipeline = device.createRenderPipeline({
                    layout: 'auto',
                    vertex: {
                        module: shaderModule,
                        entryPoint: 'vertexMain',
                        buffers: [{
                            arrayStride: 8, // 2个float，每个4字节
                            attributes: [{
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x2',
                            }],
                        }],
                    },
                    fragment: {
                        module: shaderModule,
                        entryPoint: 'fragmentMain',
                        targets: [{
                            format: presentationFormat,
                        }],
                    },
                    primitive: {
                        topology: 'triangle-list',
                    },
                });

                // 顶点缓冲区
                const vertices = new Float32Array([
                    0.0, 0.5,    // 顶部顶点
                    -0.5, -0.5,  // 左下角顶点
                    0.5, -0.5,   // 右下角顶点
                ]);

                resources.current.vertexBuffer = device.createBuffer({
                    size: vertices.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                });

                device.queue.writeBuffer(resources.current.vertexBuffer, 0, vertices);

                // 5. 启动渲染循环
                const render = () => {
                    if (!resources.current.device || !resources.current.context) return;

                    // 创建命令编码器
                    const commandEncoder = resources.current.device.createCommandEncoder();
                    
                    // 获取当前纹理
                    const texture = resources.current.context.getCurrentTexture();
                    
                    // 配置渲染通道
                    const renderPass = commandEncoder.beginRenderPass({
                        colorAttachments: [{
                            view: texture.createView(),
                            clearValue: [0, 0, 0, 1],
                            loadOp: 'clear',
                            storeOp: 'store',
                        }]
                    });

                    // 绘制指令
                    renderPass.setPipeline(resources.current.pipeline!);
                    renderPass.setVertexBuffer(0, resources.current.vertexBuffer!);
                    renderPass.draw(3);
                    renderPass.end();

                    // 提交命令
                    resources.current.device.queue.submit([commandEncoder.finish()]);

                    // 请求下一帧
                    resources.current.animationFrameId = requestAnimationFrame(render);
                };

                resources.current.animationFrameId = requestAnimationFrame(render);
            } catch (error) {
                console.error('WebGPU初始化失败:', error);
            }
        };

        initWebGPU();

        // 清理函数
        return () => {
            // 1. 停止渲染循环
            if (resources.current.animationFrameId) {
                cancelAnimationFrame(resources.current.animationFrameId);
            }

            // 2. 释放GPU资源
            if (resources.current.device) {
                // 显式释放所有GPU对象
                resources.current.vertexBuffer?.destroy();
                resources.current.pipeline = undefined;
                
                // 销毁设备
                resources.current.device.destroy();
                resources.current.device = undefined;
            }

            // 3. 重置Canvas上下文
            if (resources.current.context) {
                resources.current.context.unconfigure();
                resources.current.context = undefined;
            }

            console.log('WebGPU资源已完全释放');
        };
    }, [resources]);

    return (
        <div className="w-full h-screen">
            <canvas className="h-[90%] w-[90%] m-auto" />
        </div>
    );
}