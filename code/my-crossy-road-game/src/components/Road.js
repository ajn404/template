import * as THREE from "three";
import { tilesPerRow, tileSize } from "../constants";

// 导出一个名为Road的函数，参数为rowIndex
export function Road(rowIndex) {
  // 创建一个THREE.Group对象，用于存放道路的各个部分
  const road = new THREE.Group();
  // 设置道路的位置，根据rowIndex的值来确定道路的y轴位置
  road.position.y = rowIndex * tileSize;

  // 创建一个平面几何体，用于表示道路的底座
  const foundation = new THREE.Mesh(
    // 平面几何体的尺寸为tilesPerRow * tileSize，tileSize为每个瓦片的尺寸
    new THREE.PlaneGeometry(tilesPerRow * tileSize, tileSize),
    // 使用MeshLambertMaterial材质，颜色为0x454a59
    new THREE.MeshLambertMaterial({ color: 0x454a59 })
  );
  // 将底座添加到道路对象中
  road.add(foundation);

  // 返回道路对象
  return road;
}
