'use client'

import React, { useEffect } from 'react';
import { quitIfWebGPUNotAvailable } from "@/utils/gpu"

export default function Triangle() {
    useEffect(() => {
        main();
    }, []);

    const main = async function () {
        // 获取canvas元素
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;

        // 请求GPU适配器
        const adapter = await navigator.gpu?.requestAdapter({
            featureLevel: 'compatibility',
        });

        // 请求GPU设备
        const device = await adapter?.requestDevice();
        quitIfWebGPUNotAvailable(adapter, device);

        if (!device) return;


        // 配置canvas上下文
        const context = canvas.getContext('webgpu');
        if (!context) return;

        // 设置canvas尺寸
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;

        // 配置上下文
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
            device,
            format: presentationFormat,
            alphaMode: 'premultiplied',
        });

        // 创建着色器
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

        // 创建渲染管线
        const pipeline = device.createRenderPipeline({
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

        // 创建顶点缓冲区
        const vertices = new Float32Array([
            0.0, 0.5,    // 顶部顶点
            -0.5, -0.5,  // 左下角顶点
            0.5, -0.5,   // 右下角顶点
        ]);

        const vertexBuffer = device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        device.queue.writeBuffer(vertexBuffer, 0, vertices);

        // 渲染函数
        function render() {
            if (!device) return;
            // 创建命令编码器
            const commandEncoder = device.createCommandEncoder();
            if (!commandEncoder) return

            // 获取当前纹理视图
            const textureView = context?.getCurrentTexture().createView();
            if (!textureView) return

            // 创建渲染通道
            const renderPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }],
            };

            const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
            passEncoder.setPipeline(pipeline);
            passEncoder.setVertexBuffer(0, vertexBuffer);
            passEncoder.draw(3); // 绘制3个顶点
            passEncoder.end();

            // 提交命令缓冲区
            device?.queue.submit([commandEncoder.finish()]);

            // 每帧请求动画
            requestAnimationFrame(render);
        }

        // 开始渲染
        render();
    };

    return (
        <div className="w-full h-screen">
            <canvas className="h-[90%] w-[90%] m-auto" />
        </div>
    );
}