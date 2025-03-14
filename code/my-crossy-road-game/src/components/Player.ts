import * as THREE from "three";
import type { MoveDirection } from "../types";

export const player = Player();

function Player() {
  const player = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  body.position.z = 10;
  body.castShadow = true;
  body.receiveShadow = true;


  player.add(body);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(2, 4, 2  ),
    new THREE.MeshLambertMaterial({
      color: 0xf0619a,
      flatShading: true,
    })
  );
  cap.position.z = 21;
  cap.castShadow = true;
  cap.receiveShadow = true;
  player.add(cap);

  return player;
}

export const position: {
  currentRow: number;
  currentTile: number;
} = {
  currentRow: 0,
  currentTile: 0,
}

export const movesQueue: MoveDirection[] = [];

export const queueMove = (direction: MoveDirection) => {
  movesQueue.push(direction);
}

// 导出一个函数，用于完成一步操作
export const stepCompleted = () => {
  // 从moveQueue中取出一个方向
  const direction = movesQueue.shift();
  // 如果没有方向，则返回
  if (!direction) return;
  // 根据方向进行不同的操作
  switch (direction) {
    case "forward":
      // 向前移动，行数加1
      position.currentRow += 1;
      break;
    case "backward":
      // 向后移动，行数减1
      position.currentRow -= 1;
      break;
    case "left":
      // 向左移动，列数减1
      position.currentTile -= 1;
      break;
    case "right":
      // 向右移动，列数加1
      position.currentTile += 1;
      break;
  }
}