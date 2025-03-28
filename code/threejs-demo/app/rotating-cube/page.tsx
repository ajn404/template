'use client'

// import { quitIfWebGPUNotAvailable } from '@/utils/gpu';
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
import { mat4, vec3 } from 'wgpu-matrix';

export default function Page() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const resources = React.useRef<{
        uniformBindGroup?: GPUBindGroup;
        uniformBuffer?: GPUBuffer;
        depthTexture?: GPUTexture;
        vertexBuffer?: GPUBuffer;
        animationFrameId?: number;
        context?: GPUCanvasContext;
        device?: GPUDevice;
        pipeline?: GPURenderPipeline;
    }>({});

    const createDepthTexture = (device: GPUDevice, size: GPUExtent3D, format: GPUTextureFormat) => {
        if (resources.current.depthTexture) {
            resources.current.depthTexture.destroy();
        }
        return device.createTexture({
            size,
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,//渲染附件
        })
    }

    const cleanupResources = () => {
        if (resources.current.animationFrameId) {
            cancelAnimationFrame(resources.current.animationFrameId);
            resources.current.animationFrameId = undefined;
        }
        if (resources.current.device) {
            resources.current.device.queue.onSubmittedWorkDone().then(() => {
                resources.current.vertexBuffer?.destroy();
                resources.current.depthTexture?.destroy();
                if (resources.current.context) resources.current.context.getCurrentTexture()?.destroy();
                resources.current.uniformBuffer?.destroy();
                resources.current.pipeline = undefined;
                resources.current.uniformBindGroup = undefined;
            });
        }
        if (resources.current.context) {
            resources.current.context.unconfigure();
            resources.current.context = undefined;
        }
        resources.current.device = undefined;
        resources.current.depthTexture = undefined; // 确保深度纹理被清理
        console.log('WebGPU资源已完全释放');
    };

    React.useEffect(() => {
        const initWebGPU = async () => {
            cleanupResources(); // 先清理旧资源
            if (!canvasRef.current) {
                return;
            }
            const canvas = canvasRef.current;
            if (!canvas) return;
            const adapter = await navigator.gpu.requestAdapter({
                featureLevel: 'compatibility',
            });
            console.log('adapter', adapter);
            resources.current.device = await adapter?.requestDevice();
            // quitIfWebGPUNotAvailable(adapter, resources.current.device);
            if (!resources.current.device) return;

            // 上下文配置
            resources.current.context = canvas.getContext('webgpu') as GPUCanvasContext;
            const devicePixelRatio = window.devicePixelRatio;
            canvas.width = canvas.clientWidth * devicePixelRatio;
            canvas.height = canvas.clientHeight * devicePixelRatio;

            const presentationFormat = navigator.gpu.getPreferredCanvasFormat(); // 获取当前设备的颜色格式
            resources.current.context.configure({
                device: resources.current.device,
                format: presentationFormat,
            });

            // 创建缓冲区
            resources.current.vertexBuffer = resources.current.device.createBuffer({
                size: cubeVertexArray.byteLength,
                usage: GPUBufferUsage.VERTEX,
                mappedAtCreation: true,
            })


            // 将顶点数据写入缓冲区
            new Float32Array(resources.current.vertexBuffer.getMappedRange()).set(cubeVertexArray);
            resources.current.vertexBuffer.unmap();//解除映射

            resources.current.pipeline = resources.current.device.createRenderPipeline({
                layout: "auto",
                vertex: {
                    module: resources.current.device.createShaderModule({
                        code: basicVertWGSL,
                    }),
                    buffers: [
                        {
                            arrayStride: cubeVertexSize,
                            attributes: [
                                {
                                    shaderLocation: 0,
                                    offset: cubePositionOffset,
                                    format: 'float32x4',
                                },
                                {
                                    shaderLocation: 1,
                                    offset: cubeUVOffset,
                                    format: 'float32x2',
                                }
                            ]

                        }
                    ]//顶点缓冲区
                },
                fragment: {
                    module: resources.current.device.createShaderModule({
                        code: vertexPositionColorWGSL,//片元着色器
                    }),
                    targets: [
                        {
                            format: presentationFormat,//颜色格式
                        }
                    ]
                },
                primitive: {
                    topology: 'triangle-list',//三角形列表
                    cullMode: 'back',//背面剔除
                },
                depthStencil: {
                    depthWriteEnabled: true,//深度写入
                    depthCompare: 'less',//深度比较
                    format: 'depth24plus',//深度格式
                }
            })//创建渲染管线

            resources.current.depthTexture = createDepthTexture(resources.current.device, [canvas.width, canvas.height], 'depth24plus')

            const uniformBufferSize = 4 * 16;
            resources.current.uniformBuffer = resources.current.device.createBuffer({
                size: uniformBufferSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });// 创建一个uniform缓冲区，用于存储旋转矩阵

            resources.current.uniformBindGroup = resources.current.device.createBindGroup({
                layout: resources.current.pipeline.getBindGroupLayout(0),//获取绑定的布局
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: resources.current.uniformBuffer,
                        }
                    }
                ]
            }) //创建一个uniform绑定的组

            const renderPassDescriptor: GPURenderPassDescriptor = {
                colorAttachments: [{
                    view: undefined!,//初始值设为空
                    clearValue: [0.5, 0.5, 0.5, 1.0],
                    loadOp: 'clear',
                    storeOp: 'store',
                }] as GPURenderPassColorAttachment[],
                depthStencilAttachment: {
                    view: resources.current.depthTexture.createView(),
                    depthClearValue: 1.0,
                    depthLoadOp: 'clear',
                    depthStoreOp: 'store',
                }
            } //渲染通道描述符

            const aspect = canvas.width / canvas.height;
            const projectionMatrix = mat4.perspective((2 * Math.PI) / 5, aspect, 1, 100.0);
            const modelProjectionMatrix = mat4.create();//模型矩阵

            function getTransformationMatrix() {
                const viewMatrix = mat4.identity(); //  创建一个单位矩阵
                mat4.translate(viewMatrix, vec3.fromValues(0, 0, -4), viewMatrix); //  将矩阵沿着z轴平移4个单位
                const now = Date.now() / 1000; //  获取当前时间
                mat4.rotate(
                    viewMatrix,
                    vec3.fromValues(Math.sin(now), Math.cos(now), 0),
                    1,
                    viewMatrix
                );// 将矩阵沿着x轴旋转
                mat4.multiply(projectionMatrix, viewMatrix, modelProjectionMatrix); //将投影矩阵和视图矩阵相乘，得到最终的变换矩阵
                return modelProjectionMatrix;//返回变换矩阵
            }//获取变换矩阵

            const safeRender = () => {
                if (!resources.current.device ||
                    !resources.current.context ||
                    !resources.current.pipeline ||
                    !resources.current.depthTexture
                ) return;
                try {
                    const commandEncoder = resources.current.device.createCommandEncoder(); //  创建命令编码器
                    if (!resources.current.context || !resources.current.context.getConfiguration()?.device) return;


                    const transformationMatrix = getTransformationMatrix();
                    if (!resources.current.uniformBuffer) return;
                    resources.current.device.queue.writeBuffer(
                        resources.current.uniformBuffer,
                        0,
                        transformationMatrix.buffer,
                        transformationMatrix.byteOffset,
                        transformationMatrix.byteLength
                    );
                    const currentTexture = resources.current.context.getCurrentTexture();
                    if (!currentTexture) {
                        console.warn("无法获取当前纹理");
                        return;
                    }

                    const view = currentTexture.createView();
                    if (!view) return

                    ([...renderPassDescriptor.colorAttachments] as GPURenderPassColorAttachment[])[0].view = view;


                    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor as GPURenderPassDescriptor);

                    passEncoder.setPipeline(resources.current.pipeline);
                    passEncoder.setBindGroup(0, resources.current.uniformBindGroup);
                    passEncoder.setVertexBuffer(0, resources.current.vertexBuffer);
                    passEncoder.draw(cubeVertexCount);
                    passEncoder.end();
                    resources.current.device.queue.submit([commandEncoder.finish()]);

                    resources.current.animationFrameId = requestAnimationFrame(safeRender);
                }
                catch (error) {
                    console.error('初始化失败:', error);
                    cleanupResources();
                }

            }
            safeRender();

        }
        try {
            console.log("初始化WebGPU")
            initWebGPU().then(() => {
                console.log(resources.current)
            });
        } catch (error) {
            console.error('初始化失败:', error);
            cleanupResources();
        }

        return cleanupResources;
    }, [])

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
    )
}