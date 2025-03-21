'use client'

import React, { useEffect } from 'react';

export default function Triangle() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const resources = React.useRef<{
        device?: GPUDevice;
        context?: GPUCanvasContext;
        pipeline?: GPURenderPipeline;
        vertexBuffer?: GPUBuffer;
        multisampleTexture?: GPUTexture;
        animationFrameId?: number;
    }>({});

    // 安全创建纹理的方法
    const createMultisampleTexture = (device: GPUDevice, width: number, height: number) => {
        if (resources.current.multisampleTexture) {
            resources.current.multisampleTexture.destroy();
        }
        return device.createTexture({
            size: [width, height],
            sampleCount: 4,
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
    };

    // 增强型资源清理
    const cleanupResources = () => {
        if (resources.current.animationFrameId) {
            cancelAnimationFrame(resources.current.animationFrameId);
        }

        if (resources.current.device) {
            resources.current.device.queue.onSubmittedWorkDone().then(() => {
                resources.current.vertexBuffer?.destroy();
                resources.current.multisampleTexture?.destroy();
                resources.current.pipeline = undefined;
                resources.current.device?.destroy();
            });
        }

        if (resources.current.context) {
            resources.current.context.unconfigure();
        }

        // if (canvasRef.current) {
        //     canvasRef.current.width = 0;
        //     canvasRef.current.height = 0;
        // }
    };

    useEffect(() => {
        const initWebGPU = async () => {
            try {
                cleanupResources(); // 先清理旧资源

                const canvas = canvasRef.current;
                if (!canvas) return;

                // 等待DOM更新完成
                await new Promise(resolve => setTimeout(resolve, 50));

                // 设备初始化
                const adapter = await navigator.gpu.requestAdapter();
                resources.current.device = await adapter?.requestDevice();
                if (!resources.current.device) return;

                // 上下文配置
                resources.current.context = canvas.getContext('webgpu') as GPUCanvasContext;
                const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
                resources.current.context.configure({
                    device: resources.current.device,
                    format: presentationFormat,
                });

                // 尺寸设置
                const devicePixelRatio = window.devicePixelRatio || 1;
                canvas.width = Math.max(1, canvas.clientWidth * devicePixelRatio);
                canvas.height = Math.max(1, canvas.clientHeight * devicePixelRatio);

                // 创建多采样纹理
                resources.current.multisampleTexture = createMultisampleTexture(
                    resources.current.device,
                    canvas.width,
                    canvas.height
                );

                // 着色器模块
                const shaderModule = resources.current.device.createShaderModule({
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
                resources.current.pipeline = resources.current.device.createRenderPipeline({
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
                    multisample: {
                        count: 4
                    }
                });

                // 顶点缓冲区
                const vertices = new Float32Array([
                    0.0, 0.5,    // 顶部顶点
                    -0.5, -0.1,  // 左下角顶点
                    0.5, -0.5,   // 右下角顶点
                ]);

                resources.current.vertexBuffer = resources.current.device.createBuffer({
                    size: vertices.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                });

                resources.current.device.queue.writeBuffer(resources.current.vertexBuffer, 0, vertices);

                // 安全渲染循环
                const safeRender = () => {
                    if (!resources.current.device ||
                        !resources.current.context
                    ) return;

                    try {
                        const commandEncoder = resources.current.device.createCommandEncoder(); //  创建命令编码器

                        // 确认resources.current.context已配置
                        if (!resources.current.context||!resources.current.context.getConfiguration()?.device) return

                        const currentTexture = resources.current.context.getCurrentTexture();
                        if (!currentTexture) {
                            console.warn("无法获取当前纹理");
                            return;
                        }

                        const view = resources.current.multisampleTexture?.createView();

                        if (!view) return

                        // 配置渲染通道
                        const renderPass = commandEncoder.beginRenderPass({
                            colorAttachments: [{
                                view,
                                resolveTarget: currentTexture.createView(),
                                clearValue: [0, 0, 0, 0],
                                loadOp: 'clear',
                                storeOp: 'discard',
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
                        resources.current.animationFrameId = requestAnimationFrame(safeRender);
                    } catch (error) {
                        console.error('渲染错误:', error);
                        cleanupResources();
                    }
                };

                safeRender();
            } catch (error) {
                console.error('初始化失败:', error);
                cleanupResources();
            }
        };

        initWebGPU();
        return cleanupResources;
    }, []);

    return (
        <div className="w-full h-screen">
            <canvas
                ref={canvasRef}
                className="h-[90%] w-[90%] m-auto"
                style={{
                    minWidth: '100px',
                    minHeight: '100px',
                    background: 'transparent'
                }}
            />
        </div>
    );
}