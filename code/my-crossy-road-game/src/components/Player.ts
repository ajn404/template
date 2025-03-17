import * as THREE from "three";
import type { MoveDirection } from "../types";
import { endsUpInValidPosition } from "../utilities/endsupInValidPosition";
import { addRows, metadata as rows } from "./Map";

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
    new THREE.BoxGeometry(2, 4, 2),
    new THREE.MeshLambertMaterial({
      color: 0xf0619a,
      flatShading: true,
    })
  );
  cap.position.z = 21;
  cap.castShadow = true;
  cap.receiveShadow = true;
  player.add(cap);

  const playerContainer = new THREE.Group();
  playerContainer.add(player);

  return playerContainer;
}

export const position: {
  currentRow: number;
  currentTile: number;
} = {
  currentRow: 0,
  currentTile: 0,
}

export const movesQueue: MoveDirection[] = [];

// 导出一个函数，用于将移动方向添加到移动队列中
export const queueMove = (direction: MoveDirection) => {
  const currentPosition = {
    rowIndex: position.currentRow,
    tileIndex: position.currentTile,
  };
  const isValidPosition = endsUpInValidPosition(currentPosition, [
    ...movesQueue,
    direction,
  ]);
  if (!isValidPosition) return;
  // 将移动方向添加到移动队列中
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
  // 如果移动到最后一行，则添加一行
  if (position.currentRow > rows.length - 10) {
    addRows();
  }
}