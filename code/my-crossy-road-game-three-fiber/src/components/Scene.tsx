import { Canvas } from "@react-three/fiber";

export const Scene = ({ children }: { children: React.ReactNode }) => {
    return (
        <Canvas
            orthographic={true}
            camera={{
                up: [0, 0, 1],
                position: [300, -300, 300],
            }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-100, -100, 200]} />
            {children}
        </Canvas>
    )
}