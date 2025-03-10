# -*- coding: utf-8 -*-  # 添加编码声明
import json
import math
import random
from datetime import datetime, timedelta

def generate_trajectory():
    center_lng = -117.16
    center_lat = 32.71
    points = []
    time = datetime(2024, 1, 1, 0, 0, 0)
    
    for t in range(200):
        angle = t * 0.1
        radius = 0.0005 * angle
        noise_lng = (random.random() - 0.5) * 0.0001
        noise_lat = (random.random() - 0.5) * 0.0001
        
        lng = center_lng + radius * (1 + 0.3 * math.sin(5 * angle)) * math.cos(angle) + noise_lng
        lat = center_lat + radius * (1 + 0.3 * math.sin(5 * angle)) * math.sin(angle) + noise_lat
        
        points.append({
            "time": (time + timedelta(seconds=t*5)).isoformat() + "Z",
            "lng": round(lng, 6),
            "lat": round(lat, 6)
        })
    
    return points

trajectory = generate_trajectory()
with open("trajectory.json", "w") as f:
    json.dump(trajectory, f, indent=2)