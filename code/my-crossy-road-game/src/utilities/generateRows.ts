import * as THREE from "three";
import { minTileIndex, maxTileIndex } from "../constants";
import { type Row, type RowType } from "../types";

// 导出一个函数，用于生成指定数量的行
export function generateRows(amount: number): Row[] {
    // 创建一个空数组，用于存储生成的行
    const rows: Row[] = [];
    // 循环指定次数
    for (let i = 0; i < amount; i++) {
        // 生成一行数据
        const rowData = generateRow();
        // 将生成的行添加到数组中
        rows.push(rowData);
    }
    // 返回生成的行数组
    return rows;
}

// 生成一行数据
function generateRow(): Row {
    // 随机生成一行数据的类型
    const type: RowType = randomElement(["car", "truck", "forest"]);
    // 如果类型为car，则生成汽车车道数据
    if (type === "car") return generateCarLaneMetadata();
    // 如果类型为truck，则生成卡车车道数据
    if (type === "truck") return generateTruckLaneMetadata();
    // 如果类型为forest，则生成森林数据
    return generateForesMetadata();
}

// 随机返回数组中的一个元素
function randomElement<T>(array: T[]): T {
    // 生成一个0到数组长度之间的随机数
    return array[Math.floor(Math.random() * array.length)];
}

// 生成森林的元数据
function generateForesMetadata(): Row {
    // 创建一个空的集合，用于存储已经占用的瓦片索引
    const occupiedTiles = new Set<number>();
    // 创建一个长度为4的数组，用于存储森林中的树木
    const trees = Array.from({ length: 4 }, () => {
        // 生成一个随机的瓦片索引
        let tileIndex;
        do {
            tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
        // 如果该瓦片索引已经被占用，则重新生成
        } while (occupiedTiles.has(tileIndex));
        // 将该瓦片索引添加到已占用的集合中
        occupiedTiles.add(tileIndex);

        // 随机生成一个高度
        const height = randomElement([20, 45, 60]);

        // 返回一个包含瓦片索引和高度的树木对象
        return { tileIndex, height };
    });

    // 返回一个包含类型和树木的森林对象
    return { type: "forest", trees };
}

// 生成车辆车道元数据
function generateCarLaneMetadata(): Row {
    // 随机生成方向
    const direction = randomElement([true, false]);
    // 随机生成速度
    const speed = randomElement([125, 156, 188]);

    // 创建一个空的集合，用于存储已占用的瓦片索引
    const occupiedTiles = new Set<number>();

    // 创建一个长度为3的数组，用于存储车辆信息
    const vehicles = Array.from({ length: 3 }, () => {
        // 随机生成一个初始瓦片索引
        let initialTileIndex;
        do {
            initialTileIndex = THREE.MathUtils.randInt(
                minTileIndex,
                maxTileIndex
            );
        } while (occupiedTiles.has(initialTileIndex));
        // 将初始瓦片索引及其左右相邻的瓦片索引添加到已占用的集合中
        occupiedTiles.add(initialTileIndex - 1);
        occupiedTiles.add(initialTileIndex);
        occupiedTiles.add(initialTileIndex + 1);

        // 随机生成车辆颜色
        const color: THREE.ColorRepresentation = randomElement([
            0xa52523, 0xbdb638, 0x78b14b,
        ]);

        // 返回车辆信息
        return { initialTileIndex, color };
    });

    // 返回车辆车道元数据
    return { type: "car", direction, speed, vehicles };
}

// 生成卡车车道元数据
function generateTruckLaneMetadata(): Row {
    // 随机生成方向
    const direction = randomElement([true, false]);
    // 随机生成速度
    const speed = randomElement([125, 156, 188]);

    // 创建一个空的集合，用于存储已占用的瓦片索引
    const occupiedTiles = new Set<number>();

    // 创建一个长度为2的数组，用于存储车辆信息
    const vehicles = Array.from({ length: 2 }, () => {
        // 随机生成一个初始瓦片索引
        let initialTileIndex;
        do {
            initialTileIndex = THREE.MathUtils.randInt(
                minTileIndex,
                maxTileIndex
            );
        } while (occupiedTiles.has(initialTileIndex));
        // 将初始瓦片索引及其周围的瓦片索引添加到已占用的集合中
        occupiedTiles.add(initialTileIndex - 2);
        occupiedTiles.add(initialTileIndex - 1);
        occupiedTiles.add(initialTileIndex);
        occupiedTiles.add(initialTileIndex + 1);
        occupiedTiles.add(initialTileIndex + 2);

        // 随机生成车辆颜色
        const color: THREE.ColorRepresentation = randomElement([
            0xa52523, 0xbdb638, 0x78b14b,
        ]);

        // 返回车辆信息
        return { initialTileIndex, color };
    });

    // 返回卡车车道元数据
    return { type: "truck", direction, speed, vehicles };
}