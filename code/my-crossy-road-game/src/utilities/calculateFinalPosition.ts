import { MoveDirection } from "../types";

export const calculateFinalPosition = (
    currentPosition: {
        rowIndex: number;
        tileIndex: number;
    },
    movers: MoveDirection[],
) => {
    return movers.reduce(
        (position, direction) => {
            switch (direction) {
                case 'backward':
                    return {
                        rowIndex: position.rowIndex - 1,
                        tileIndex: position.tileIndex,
                    }
                case 'forward':
                    return {
                        rowIndex: position.rowIndex + 1,
                        tileIndex: position.tileIndex,
                    }
                case 'left':
                    return {
                        rowIndex: position.rowIndex,
                        tileIndex: position.tileIndex - 1,
                    }
                case 'right':
                    return {

                        rowIndex: position.rowIndex,
                        tileIndex: position.tileIndex + 1,
                    }
                default:
                    return position;

            }
        },
        currentPosition
    )
};