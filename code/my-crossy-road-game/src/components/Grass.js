import * as THREE from "three";
import { tilesPerRow, tileSize } from "../constants";

// 导出一个函数，用于创建草
export function Grass(rowIndex) {
  // 创建一个THREE.Group对象，用于存放草的各个部分
  const grass = new THREE.Group();
  // 设置草的位置，根据行数和tileSize计算
  grass.position.y = rowIndex * tileSize;

  // 创建一个立方体，作为草的底座
  const foundation = new THREE.Mesh(
    // 使用BoxGeometry创建一个立方体，参数为底座的宽、高、深
    new THREE.BoxGeometry(tilesPerRow * tileSize, tileSize, 3),
    // 使用MeshLambertMaterial设置底座的材质，颜色为0xbaf455
    new THREE.MeshLambertMaterial({ color: 0xbaf455 })
  );
  // 设置底座的位置，使其在草的底部
  foundation.position.z = 1.5;
  foundation.receiveShadow = true;
  // 将底座添加到草的组中
  grass.add(foundation);

  // 返回草的组
  return grass;
}
