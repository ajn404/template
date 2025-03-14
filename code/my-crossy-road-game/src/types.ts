import * as THREE from 'three';

export interface TreeData {
  tileIndex: number;
  height: number;
}

export interface VehicleData {
  initialTileIndex: number;
  color: number;
  ref?: THREE.Group;
}

export interface ForestRowData {
  type: 'forest';
  trees: TreeData[];
}

export interface VehicleRowData {
  type: 'car' | 'truck';
  direction: boolean;
  speed: number;
  vehicles: VehicleData[];
}

export type RowData = ForestRowData | VehicleRowData;

export type MoveDirection = "forward" | "backward" | "left" | "right";