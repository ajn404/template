import * as THREE from "three";
import { tileSize } from "../constants";

// 导出一个函数，用于创建一个树
export function Tree(tileIndex, height) {
  // 创建一个THREE.Group对象，用于存放树的所有部分
  const tree = new THREE.Group();
  // 设置树的位置，根据tileIndex和tileSize计算
  tree.position.x = tileIndex * tileSize;

  // 创建树干，使用BoxGeometry和MeshLambertMaterial创建一个立方体
  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({
      color: 0x4d2926,
      flatShading: true,
    })
  );
  // 设置树干的位置，使其在树底部
  trunk.position.z = 10;
  // 将树干添加到树中
  tree.add(trunk);

  // 创建树冠，使用BoxGeometry和MeshLambertMaterial创建一个立方体
  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(30, 30, height),
    new THREE.MeshLambertMaterial({
      color: 0x7aa21d,
      flatShading: true,
    })
  );
  // 设置树冠的位置，使其在树干顶部
  crown.position.z = height / 2 + 20;
  crown.castShadow = true; // 设置树冠投射阴影
  crown.receiveShadow = true; // 设置树冠接收阴影

  // 将树冠添加到树中
  tree.add(crown);

  // 返回树
  return tree;
}
