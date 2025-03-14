import * as THREE from "three";
import { metadata } from "./components/Map";
import { minTileIndex, maxTileIndex, tileSize } from "./constants";
import { VehicleRowData } from "./types";

const clock: THREE.Clock = new THREE.Clock();

// 导出一个函数，用于动画化车辆
export function animateVehicles(): void {
  // 获取时间间隔
  const delta: number = clock.getDelta();
  metadata.forEach((rowData) => {
    if (rowData.type === "car" || rowData.type === "truck") {
      const vehicleRow = rowData as VehicleRowData;
      const beginningOfRow: number = (minTileIndex - 2) * tileSize;
      const endOfRow: number = (maxTileIndex + 2) * tileSize;
      vehicleRow.vehicles.forEach(({ ref }) => {
        if (!ref) return;
        if (vehicleRow.direction) {
          ref.position.x =
            ref.position.x > endOfRow
              ? beginningOfRow
              : ref.position.x + vehicleRow.speed * delta;
        } else {
          ref.position.x =
            ref.position.x < beginningOfRow
              ? endOfRow
              : ref.position.x - vehicleRow.speed * delta;
        }
      });
    }
  });
} 