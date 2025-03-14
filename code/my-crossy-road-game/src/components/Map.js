import * as THREE from "three";
import { Grass } from "./Grass";
import { Tree } from "./Tree";

export const metadata = [
  {
    type: "forest",
    trees: [
      { tileIndex: -3, height: 50 },
      { tileIndex: 2, height: 30 },
      { tileIndex: 5, height: 50 },
    ],
  },
];

export const map = new THREE.Group();

// 导出一个名为initializeMap的函数
export function initializeMap() {
  // 创建一个草对象
  const grass = Grass(0);
  // 将草对象添加到地图中
  map.add(grass);
  // 添加行
  addRows();
}

// 导出一个函数addRows
export function addRows() {
  // 遍历metadata数组
  metadata.forEach((rowData, index) => {
    // 获取行索引
    const rowIndex = index + 1;

    // 如果rowData的类型为"forest"
    if (rowData.type === "forest") {
      // 创建一个Grass对象
      const row = Grass(rowIndex);

      // 遍历rowData中的trees数组
      rowData.trees.forEach(({ tileIndex, height }) => {
        // 创建一个Tree对象
        const three = Tree(tileIndex, height);
        // 将Tree对象添加到row中
        row.add(three);
      });

      // 将row添加到map中
      map.add(row);
    }
  });
}
