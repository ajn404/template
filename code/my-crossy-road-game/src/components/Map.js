import * as THREE from "three";
import { Grass } from "./Grass";
import { Road } from "./Road";
import { Tree } from "./Tree";
import { Car } from "./Car";

export const metadata = [
  {
    type: "car",
    direction: false,
    speed: 1,
    vehicles: [{ initialTileIndex: 2, color: 0xff0000 }],
  },
];

export const map = new THREE.Group();

export function initializeMap() {
  const grass = Grass(0);
  map.add(grass);
  addRows();
}

export function addRows() {
  metadata.forEach((rowData, index) => {
    const rowIndex = index + 1;

    if (rowData.type === "forest") {
      const row = Grass(rowIndex);

      rowData.trees.forEach(({ tileIndex, height }) => {
        const three = Tree(tileIndex, height);
        row.add(three);
      });

      map.add(row);
    }

    if (rowData.type === "car") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const car = Car(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        row.add(car);
      });

      map.add(row);
    }
  });
}
