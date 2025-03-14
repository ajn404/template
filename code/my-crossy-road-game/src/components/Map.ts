import * as THREE from "three";
import { Grass } from "./Grass";
import { Road } from "./Road";
import { Tree } from "./Tree";
import { Car } from "./Car";
import { Truck } from "./Truck";
import { RowData, ForestRowData, VehicleRowData } from "../types";

export const metadata: RowData[] = [
  {
    type: "car",
    direction: false,
    speed: 188,
    vehicles: [
      { initialTileIndex: -4, color: 0xbdb638 },
      { initialTileIndex: -1, color: 0x78b14b },
      { initialTileIndex: 4, color: 0xa52523 },
    ],
  },
  {
    type: "forest",
    trees: [
      { tileIndex: -5, height: 50 },
      { tileIndex: 0, height: 30 },
      { tileIndex: 3, height: 50 },
    ],
  },
  {
    type: "truck",
    direction: true,
    speed: 125,
    vehicles: [
      { initialTileIndex: -4, color: 0x78b14b },
      { initialTileIndex: 0, color: 0xbdb638 },
    ],
  },
  {
    type: "forest",
    trees: [
      { tileIndex: -8, height: 30 },
      { tileIndex: -3, height: 50 },
      { tileIndex: 2, height: 30 },
    ],
  },
];

export const map: THREE.Group = new THREE.Group();

export function initializeMap(): void {
  for (let rowIndex = 0; rowIndex > -5; rowIndex--) {
    const grass = Grass(rowIndex);
    map.add(grass);
  }
  addRows();
}

export function addRows(): void {
  metadata.forEach((rowData, index) => {
    const rowIndex = index + 1;

    if (rowData.type === "forest") {
      const row = Grass(rowIndex);
      const forestRow = rowData as ForestRowData;

      forestRow.trees.forEach(({ tileIndex, height }) => {
        const three = Tree(tileIndex, height);
        row.add(three);
      });

      map.add(row);
    }

    if (rowData.type === "car" || rowData.type === "truck") {
      const row = Road(rowIndex);
      const vehicleRow = rowData as VehicleRowData;

      vehicleRow.vehicles.forEach((vehicle) => {
        if (rowData.type === "car") {
          const car = Car(
            vehicle.initialTileIndex,
            vehicleRow.direction,
            vehicle.color
          );
          vehicle.ref = car; // 收集车辆的引用
          row.add(car);
        } else if (rowData.type === "truck") {
          const truck = Truck(
            vehicle.initialTileIndex,
            vehicleRow.direction,
            vehicle.color
          );
          vehicle.ref = truck; // 收集卡车的引用
          row.add(truck);
        }
      });

      map.add(row);
    }
  });
} 