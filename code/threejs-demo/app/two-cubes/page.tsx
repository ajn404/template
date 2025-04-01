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
    uniformBuffer?: GPUBuffer
    uniformBindGroup?: GPUBindGroup
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
        const format = navigator.gpu.getPreferredCanvasFormat()

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

        const uniformBuffer = device.createBuffer({
            size: 16 * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        const uniformBindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
        })

        resources.current = {
            ...resources.current,
            device,
            context,
            vertexBuffer,
            pipeline,
            depthTexture,
            uniformBuffer,
            uniformBindGroup
        }

        return { device, context, pipeline, depthTexture, uniformBuffer, uniformBindGroup }
    }

    // 清理资源
    const cleanup = () => {
        resources.current.animationFrameId && cancelAnimationFrame(resources.current.animationFrameId)
        const destroy = (resource?: { destroy?: () => void }) => resource?.destroy?.()

        resources.current.device?.queue.onSubmittedWorkDone().then(() => {
            destroy(resources.current.vertexBuffer)
            destroy(resources.current.depthTexture)
            destroy(resources.current.context?.getCurrentTexture())
            destroy(resources.current.uniformBuffer)
        })

        resources.current.context?.unconfigure()
        resources.current = {}
    }

    // 返回初始化资源和清理资源的函数
    return { initResources, cleanup, resources }
}

const useAnimation = (resources: React.RefObject<WebGPUResources>) => {
    const render = React.useCallback(() => {
        const { device, context, pipeline, uniformBuffer, uniformBindGroup, vertexBuffer, depthTexture } = resources.current
        if (!device || !context || !pipeline || !depthTexture) return

        const aspect = context.canvas.width / context.canvas.height
        const projectionMatrix = mat4.perspective(2 * Math.PI / 5, aspect, 1, 100)
        const viewMatrix = mat4.translate(mat4.identity(), vec3.fromValues(0, 0, -4))
        mat4.rotate(viewMatrix, vec3.fromValues(Math.sin(Date.now() / 1000), Math.cos(Date.now() / 1000), 0), 1, viewMatrix)

        const transformationMatrix = mat4.multiply(projectionMatrix, viewMatrix)
        device.queue.writeBuffer(uniformBuffer!, 0, transformationMatrix as Float32Array)

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
        renderPass.setBindGroup(0, uniformBindGroup!)
        renderPass.setVertexBuffer(0, vertexBuffer!)
        renderPass.draw(cubeVertexCount)
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