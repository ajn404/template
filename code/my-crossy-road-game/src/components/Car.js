import * as THREE from "three";
import { tileSize } from "../constants";
import { Wheel } from "./Wheel";

// 导出一个名为Car的函数，用于创建一个汽车模型
export function Car(initialTileIndex, direction, color) {
  // 创建一个THREE.Group对象，用于存放汽车模型的所有组件
  const car = new THREE.Group();
  // 设置汽车模型的位置，根据初始瓦片索引和瓦片大小计算
  car.position.x = initialTileIndex * tileSize;
  // 如果没有指定方向，则将汽车模型旋转180度
  if (!direction) car.rotation.z = Math.PI;

  // 创建汽车模型的主要部分，使用BoxGeometry和MeshLambertMaterial创建一个立方体
  const main = new THREE.Mesh(
    new THREE.BoxGeometry(60, 30, 15),
    new THREE.MeshLambertMaterial({ color, flatShading: true })
  );
  // 设置汽车模型的主要部分的位置
  main.position.z = 12;
  // 将汽车模型的主要部分添加到汽车模型中
  car.add(main);

  // 创建汽车模型的驾驶舱部分，使用BoxGeometry和MeshLambertMaterial创建一个立方体
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(33, 24, 12),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  // 设置汽车模型的驾驶舱部分的位置
  cabin.position.x = -6;
  cabin.position.z = 25.5;
  // 将汽车模型的驾驶舱部分添加到汽车模型中
  car.add(cabin);

  // 创建汽车模型的前轮部分，使用Wheel函数创建一个轮子
  const frontWheel = Wheel(18);
  // 将汽车模型的前轮部分添加到汽车模型中
  car.add(frontWheel);

  // 创建汽车模型的后轮部分，使用Wheel函数创建一个轮子
  const backWheel = Wheel(-18);
  // 将汽车模型的后轮部分添加到汽车模型中
  car.add(backWheel);

  // 返回汽车模型
  return car;
}
