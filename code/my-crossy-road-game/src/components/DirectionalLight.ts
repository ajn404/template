import * as THREE from "three";

// 导出一个DirectionalLight函数
export function DirectionalLight(): THREE.DirectionalLight {
  // 创建一个DirectionalLight对象
  const dirLight = new THREE.DirectionalLight();
  // 设置DirectionalLight的位置
  dirLight.position.set(-100, -100, 200);
  // 设置DirectionalLight的向上方向
  dirLight.up.set(0, 0, 1);
  // 设置DirectionalLight是否投射阴影
  dirLight.castShadow = true;

  // 设置DirectionalLight的阴影贴图大小
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;

  // 设置DirectionalLight的阴影相机向上方向
  dirLight.shadow.camera.up.set(0, 0, 1);
  // 设置DirectionalLight的阴影相机左边界
  dirLight.shadow.camera.left = -400;
  // 设置DirectionalLight的阴影相机右边界
  dirLight.shadow.camera.right = 400;
  // 设置DirectionalLight的阴影相机上边界
  dirLight.shadow.camera.top = 400;
  // 设置DirectionalLight的阴影相机下边界
  dirLight.shadow.camera.bottom = -400;
  // 设置DirectionalLight的阴影相机近裁剪面
  dirLight.shadow.camera.near = 50;
  // 设置DirectionalLight的阴影相机远裁剪面
  dirLight.shadow.camera.far = 400;

  // 返回DirectionalLight对象
  return dirLight;
} 