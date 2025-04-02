'use client'

import React from 'react'
import { mat4, vec3 } from 'wgpu-matrix'
import {
    cubeVertexArray,
    cubeVertexSize,
    cubeUVOffset,
    cubePositionOffset,
    cubeVertexCount,
} from '../rotating-cube/cube'
import basicVertWGSL from '@/utils/shaders/basic.vert.wgsl'
import vertexPositionColorWGSL from '@/utils/shaders/vertexPositionColor.frag.wgsl'

type WebGPUResources = {
    device?: GPUDevice
    context?: GPUCanvasContext
    pipeline?: GPURenderPipeline
    vertexBuffer?: GPUBuffer
    depthTexture?: GPUTexture
    animationFrameId?: number
}


// 定义一个useWebGPU函数，用于初始化WebGPU资源
const useWebGPU = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
    // 使用useRef来存储WebGPU资源
    const resources = React.useRef<WebGPUResources>({})

    // 创建深度纹理
    const createDepthTexture = (device: GPUDevice, size: GPUExtent3D, format: GPUTextureFormat) => {
        // 如果当前存在深度纹理，则销毁
        resources.current.depthTexture?.destroy()
        // 创建新的深度纹理
        return device.createTexture({
            size,
            format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        })
    }

    // 创建渲染管线
    const createPipeline = (device: GPUDevice, format: GPUTextureFormat) => {
        return device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: device.createShaderModule({ code: basicVertWGSL }),
                buffers: [{
                    arrayStride: cubeVertexSize,
                    attributes: [
                        { shaderLocation: 0, offset: cubePositionOffset, format: 'float32x4' },
                        { shaderLocation: 1, offset: cubeUVOffset, format: 'float32x2' }
                    ]
                }]
            },
            fragment: {
                module: device.createShaderModule({ code: vertexPositionColorWGSL }),
                targets: [{ format }]
            },
            primitive: { topology: 'triangle-list', cullMode: 'back' },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus'
            }
        })
    }

    // 初始化资源
    const initResources = async () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const adapter = await navigator.gpu.requestAdapter()
        const device = await adapter?.requestDevice()
        if (!device) return

        const context = canvas.getContext('webgpu') as GPUCanvasContext
        const format: GPUTextureFormat = navigator.gpu.getPreferredCanvasFormat()

        const devicePixelRatio = window.devicePixelRatio
        canvas.width = canvas.clientWidth * devicePixelRatio
        canvas.height = canvas.clientHeight * devicePixelRatio

        context.configure({ device, format })

        const vertexBuffer = device.createBuffer({
            size: cubeVertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        })
        new Float32Array(vertexBuffer.getMappedRange()).set(cubeVertexArray)
        vertexBuffer.unmap()

        const pipeline = createPipeline(device, format)
        const depthTexture = createDepthTexture(device, [canvas.width, canvas.height], 'depth24plus')

        resources.current = {
            ...resources.current,
            device,
            context,
            vertexBuffer,
            pipeline,
            depthTexture,
        }

        return { device, context, pipeline, depthTexture }
    }

    // 清理资源
    const cleanup = () => {
        resources.current.animationFrameId && cancelAnimationFrame(resources.current.animationFrameId)
        const destroy = (resource?: { destroy?: () => void }) => resource?.destroy?.()

        resources.current.device?.queue.onSubmittedWorkDone().then(() => {
            destroy(resources.current.vertexBuffer)
            destroy(resources.current.depthTexture)
            destroy(resources.current.context?.getCurrentTexture())
        })

        resources.current.context?.unconfigure()
        resources.current = {}
    }

    // 返回初始化资源和清理资源的函数
    return { initResources, cleanup, resources }
}

const useAnimation = (resources: React.RefObject<WebGPUResources>) => {

    const render = React.useCallback(() => {
        const { device, context, pipeline, vertexBuffer, depthTexture } = resources.current
        if (!device || !context || !pipeline || !depthTexture) return () => { }

        const commandEncoder = device.createCommandEncoder()
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: [0.5, 0.5, 0.5, 1],
                loadOp: 'clear',
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: depthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        })

        renderPass.setPipeline(pipeline)
        renderPass.setVertexBuffer(0, vertexBuffer!)

        renderPass.end()

        device.queue.submit([commandEncoder.finish()])
        resources.current.animationFrameId = requestAnimationFrame(render)
    }, [])

    return render
}


export default function Page() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const { initResources, cleanup, resources } = useWebGPU(canvasRef as React.RefObject<HTMLCanvasElement>);
    const render = useAnimation(resources)
    React.useEffect(() => {

        initResources().then(() => {
            render()
        })

        return () => {
            cleanup()
            resources.current.animationFrameId && cancelAnimationFrame(resources.current.animationFrameId)
        }
    })

    return <>
        <div className="w-full h-screen">
            <canvas
                ref={canvasRef}
                className="h-[90%] w-[90%] m-auto"
                style={{ minWidth: 100, minHeight: 100, background: 'transparent' }}
            />
        </div>

    </>
}