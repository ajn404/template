export const Player = () => {
    return (
        <mesh position={[0, 0, 10]}>
            <boxGeometry args={[15, 15, 20]} />
            <meshLambertMaterial color={0xff0000} flatShading />
        </mesh>
    )
}
