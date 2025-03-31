class NoiseGradientPainter {
  // 静态方法，获取输入属性
  static get inputProperties() {
    // 返回一个数组，包含四个属性：--mouse-x，--mouse-y，--color-1，--color-2，--color-3
    return ["--mouse-x", "--mouse-y", "--color-1", "--color-2", "--color-3"];
  }

  // 绘制函数
  paint(ctx, geometry, props) {
    // 获取画布宽高
    const width = geometry.width;
    const height = geometry.height;
    // 获取鼠标位置
    const mouseX = parseFloat(props.get("--mouse-x")) / width;
    const mouseY = parseFloat(props.get("--mouse-y")) / height;
    // 获取颜色
    const colors = [
      props.get("--color-1").toString(),
      props.get("--color-2").toString(),
      props.get("--color-3").toString(),
    ];

    // 生成噪点渐变
    const gradient = ctx.createLinearGradient(
      0,
      0,
      width * mouseX,
      height * mouseY
    );
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]); // 根据鼠标位置动态调整
    gradient.addColorStop(1, colors[2]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 叠加噪点纹理
    for (let i = 0; i < width * height * 0.02; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const opacity = Math.random() * 0.2 + 0.1;
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

registerPaint("noise-gradient", NoiseGradientPainter);
