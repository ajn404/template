function generateTrajectory() {
  const centerLng = -117.16;
  const centerLat = 32.71;
  const points = [];
  // 初始时间的时间戳（2024-01-01 00:00:00 UTC）
  const baseTime = new Date("2024-01-01T00:00:00Z").getTime();

  for (let t = 0; t < 200; t++) {
    const angle = t * 0.1;
    const radius = 0.0005 * angle;

    // 生成坐标
    const lng =
      centerLng +
      radius * (1 + 0.3 * Math.sin(5 * angle)) * Math.cos(angle) +
      (Math.random() - 0.5) * 0.0001;

    const lat =
      centerLat +
      radius * (1 + 0.3 * Math.sin(5 * angle)) * Math.sin(angle) +
      (Math.random() - 0.5) * 0.0001;

    // 生成时间戳（每5秒一个点）
    const timestamp = baseTime + t * 5000; // 5000毫秒 = 5秒

    points.push({
      time: timestamp, // 毫秒级时间戳
      lng: Number(lng.toFixed(6)),
      lat: Number(lat.toFixed(6)),
    });
  }

  return points;
}

// 使用示例
const trajectory = generateTrajectory();
console.log(trajectory);

/* 输出示例：
[
  {
    time: 1704067200000,  // 2024-01-01 00:00:00 UTC
    lng: -117.16,
    lat: 32.71
  },
  {
    time: 1704067205000,  // 2024-01-01 00:00:05 UTC
    lng: -117.159886,
    lat: 32.709971
  },
  // ...
]
*/
