const gpu = {
  const CHECKERBOARD_BACKGROUND_CSS = `
    background-image: 
      linear-gradient(45deg, #eee 25%, transparent 25%), 
      linear-gradient(-45deg, #eee 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #eee 75%), 
      linear-gradient(-45deg, transparent 75%, #eee 75%);
    background-size: 32px 32px;
    background-position: 0 0, 0 16px, 16px -16px, -16px 0px;
  `;
  
  const context = (width = 512, height = 512, contextType = 'webgpu') => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = CHECKERBOARD_BACKGROUND_CSS;
    const context = canvas.getContext(contextType);
    return context;
  };
  
  const format = () => navigator.gpu.getPreferredCanvasFormat();
  
  const device = async () => {
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    return { adapter, device, format };
  };
  
  const init = async (width = 512, height = 512) => {
    const ctx = context(width, height, 'webgpu') /* as GPUCanvasContext*/;
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: 'premultiplied' });
  
    return { context: ctx, adapter, device, format };
  };
  
  const sampler = (device /*: GPUDevice*/, options = {}) => {
    return device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
      mipmapFilter: 'linear',
      ...options,
    });
  };

  // interface BaseTextureOptions {
  //   format?: GPUTextureFormat;
  //   usage: number;
  //   label?: string;
  // }

  // interface ImageTextureOptions {
  //   width: number;
  //   height: number;
  //   flipY?: boolean;
  // }

  // Defaults to storage texture
  const createTexture = (
    device /*: GPUDevice */,
    {
      width,
      height,
      format = 'rgba8unorm',
      usage = GPUTextureUsage.COPY_DST |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
      label,
    } /*: BaseTextureOptions & ImageTextureOptions,*/
  ) /*: GPUTexture*/ => {
    return device.createTexture({
      ...(label && { label }),
      format,
      size: [width, height],
      usage,
    });
  };
  
  const canvasTexture = (
    device /*: GPUDevice*/,
    canvas /*: HTMLCanvasElement*/,
    {
      format = 'rgba8unorm',
      flipY = true,
      usage = GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
      label,
    } /*: Partial<BaseTextureOptions & ImageTextureOptions>*/ = {},
  ) /*: GPUTexture*/ => {
    const texture = device.createTexture({
      ...(label && { label }),
      format,
      size: [canvas.width, canvas.height],
      usage,
    });
    device.queue.copyExternalImageToTexture(
      { source: canvas, flipY },
      { texture },
      [canvas.width, canvas.height],
    );
    return texture;
  };
  
  const DefaultUsage = {
    STORAGE: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    UNIFORM: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  };

  // interface WrappedBuffer {
  //   write: (next?: any) => void;
  //   buffer: GPUBuffer;
  // }

  const buffer = (
    device /*: GPUDevice */,
    values /*: any */,
    {
      usage,
      offset = 0,
      skipInitialWrite = false,
    } /*: { usage: BaseTextureOptions['usage']; offset?: number } */,
  ) /*: WrappedBuffer*/ => {
    const buffer = device.createBuffer({
      size: values.byteLength,
      usage,
    });
    if (!skipInitialWrite) {
      device.queue.writeBuffer(buffer, offset, values);
    }
    return {
      buffer,
      write: (next = values) => device.queue.writeBuffer(buffer, offset, next),
    };
  };
  
  const storageBuffer = (
    device /*: GPUDevice*/,
    values /*: any*/,
    options /*: Partial<BaseTextureOptions>*/ = {},
  ) => {
    return buffer(device, values, {
      ...options,
      usage: options.usage ?? DefaultUsage.STORAGE,
    });
  };
  
  const uniformBuffer = (
    device /*: GPUDevice*/,
    values /*: any*/,
    options /*: Partial<BaseTextureOptions>*/ = {},
  ) => {
    return buffer(device, values, {
      ...options,
      usage: options.usage ?? DefaultUsage.UNIFORM,
    });
  };

  const contextDimensions = context => ({ width: context.canvas.width, height: context.canvas.height });
  
  // Shaders
  
  // type ShaderInjections = { [key: string]: string | number };

  const defaultRegex = (key, value) => '\\$\\{' + key + '\\}';
  
  // TODO compose shaders using a JS API
  const injectShader = (
    shader /* : string*/, 
    injections/* : ShaderInjections*/ = {}, 
    regexStr = defaultRegex
  ) => {
    return Object.entries(injections).reduce((shader, [k, v]) => {
      const regex = new RegExp(regexStr(k, v), 'g');
      return shader.replace(regex, String(v));
    }, shader);
  };

  const prependShader = (shader, header) => header + '\n\n' + shader;
  
  const bindGroupEntry = (
    binding /*: number*/,
    resource /*: GPUSampler | GPUTexture | GPUBuffer | WrappedBuffer*/,
  ) => {
    let r;
    if (resource instanceof GPUSampler) r = resource;
    else if (resource instanceof GPUTexture) r = resource.createView();
    else if (resource instanceof GPUBuffer) r = { buffer: resource };
    // specific to the util above
    else if (resource.hasOwnProperty('buffer')) r = { buffer: resource.buffer };
    else r = resource;
    return { binding, resource: r };
  };

  const mapBuffer = (device, arr /* : TypedArray*/, bufferOptions = {}) => {
    const Constructor = arr.constructor; /* as TypedArrayConstructor */
    const buffer = device.createBuffer({
      size: arr.byteLength,
      mappedAtCreation: true,
      ...bufferOptions,
    });
    new Constructor(buffer.getMappedRange()).set(arr);
    buffer.unmap();
    return buffer;
  };

  // via https://webgpufundamentals.org/webgpu/lessons/webgpu-transparency.html
  const Blending /*: { [name: string]: GPUBlendState }*/ = {
    SourceOver: {
      color: {
        operation: 'add',
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'one',
        dstFactor: 'one-minus-src-alpha',
      },
    },
    DestinationOver: {
      color: {
        operation: 'add',
        srcFactor: 'one-minus-dst-alpha',
        dstFactor: 'one',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'one-minus-dst-alpha',
        dstFactor: 'one',
      },
    },
    Additive: {
      color: {
        operation: 'add',
        srcFactor: 'one',
        dstFactor: 'one',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'one',
        dstFactor: 'one',
      },
    },
    SourceIn: {
      color: {
        operation: 'add',
        srcFactor: 'dst-alpha',
        dstFactor: 'zero',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'dst-alpha',
        dstFactor: 'zero',
      },
    },
    DestinationIn: {
      color: {
        operation: 'add',
        srcFactor: 'zero',
        dstFactor: 'src-alpha',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'zero',
        dstFactor: 'src-alpha',
      },
    },
    SourceOut: {
      color: {
        operation: 'add',
        srcFactor: 'one-minus-dst-alpha',
        dstFactor: 'zero',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'one-minus-dst-alpha',
        dstFactor: 'zero',
      },
    },
    DestinationOut: {
      color: {
        operation: 'add',
        srcFactor: 'zero',
        dstFactor: 'one-minus-src-alpha',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'zero',
        dstFactor: 'one-minus-src-alpha',
      },
    },
    SourceAtop: {
      color: {
        operation: 'add',
        srcFactor: 'dst-alpha',
        dstFactor: 'one-minus-src-alpha',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'dst-alpha',
        dstFactor: 'one-minus-src-alpha',
      },
    },
    DestinationAtop: {
      color: {
        operation: 'add',
        srcFactor: 'one-minus-dst-alpha',
        dstFactor: 'src-alpha',
      },
      alpha: {
        operation: 'add',
        srcFactor: 'one-minus-dst-alpha',
        dstFactor: 'src-alpha',
      },
    },
  };
  
  const gpu = {
    device,
    context,
    init,
    format,
    sampler,
    canvasTexture,
    createTexture,
    storageBuffer,
    uniformBuffer,
    contextDimensions,
    bindGroupEntry,
    mapBuffer,
    shader: {
      inject: injectShader,
      prepend: prependShader,
    },
    Usage: {
      StorageTexture:
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT,
      CopyTexture:
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT,
    },
    Blending,
    LinearSampler: Object.freeze({
      minFilter: 'linear',
      magFilter: 'linear',
      mipmapFilter: 'linear',
    })
  };
  
  return gpu
}


const shaders = ({
  hsl2rgb: /* wgsl */ `
    fn hsl2rgb(hsl: vec3f) -> vec3f {
      let c = vec3f(fract(hsl.x), clamp(hsl.yz, vec2f(0), vec2f(1)));
      let rgb = clamp(abs((c.x * 6.0 + vec3f(0.0, 4.0, 2.0)) % 6.0 - 3.0) - 1.0, vec3f(0), vec3f(1));
      return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
    }
  `,
  // www.cs.ubc.ca/~rbridson/docs/schechter-sca08-turbulence.pdf
  hash: /* wgsl */ `
    fn hash(ini: u32) -> u32 {
      var state = ini;
      state ^= 2747636419u;
      state *= 2654435769u;
      state ^= state >> 16;
      state *= 2654435769u;
      state ^= state >> 16;
      state *= 2654435769u;
      return state;
    }
  `,
  // https://www.shadertoy.com/view/4djSRW (MIT License, (c) David Hoskins)
  hash14: /* wgsl */ `
    fn hash14(_p4: vec4f) -> f32 {
      var p4 = fract(_p4 * vec4f(.1031, .1030, .0973, .1099));
      p4 += dot(p4, p4.wzxy + 33.33);
      return fract((p4.x + p4.y) * (p4.z + p4.w));
    }
  `,
  shift: /* wgsl */ `
    fn shift(x: f32, size: f32) -> f32 {
      return x + select(0.0, size, x < 0) + select(0.0, -size, x >= size);
    }
  `,
  
  // On generating random numbers, with help of y= [(a+x)sin(bx)] mod 1", W.J.J. Rey, 
  // 22nd European Meeting of Statisticians 1998
  rand11: `fn rand11(n: f32) -> f32 { return fract(sin(n) * 43758.5453123); }`,
  rand22: `fn rand22(n: vec2f) -> f32 { return fract(sin(dot(n, vec2f(12.9898, 4.1414))) * 43758.5453); }`,
  
  // hashes: https://www.shadertoy.com/view/4djSRW (MIT License, (c) David Hoskins) 
  hash11: `
    fn hash11(_p: f32) -> f32 {
      var p = fract(_p * .1031);
      p *= p + 33.33;
      p *= p + p;
      return fract(p);
    }
  `,
  hash12: `
    fn hash12(p: vec2f) -> f32 {
    	var p3 = fract(vec3f(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
  `,
  hash13: `
    fn hash13(_p3: vec3f) -> f32 {
    	var p3 = fract(_p3 * .1031);
      p3 += dot(p3, p3.zyx + 31.32);
      return fract((p3.x + p3.y) * p3.z);
    }
  `,
  shift: `
    fn shift(x: f32, size: f32) -> f32 { return x + select(0.0, size, x < 0) + select(0.0, -size, x >= size); }
  `,
  // Don't know where these came from
  rnd: `
    fn rnd(a: u32) -> f32 {
      var h   = hash(a);
      var msk = (1u << 23u) - 1u;
      return f32(h & msk) / f32(1u << 23u);
    }
  `,
  hash_: `
    fn hash(a: u32) -> u32 {
      var x = a;
      x ^= x >> 17;  x *= 0xed5ad4bbu;
      x ^= x >> 11;  x *= 0xac4c1b51u;
      x ^= x >> 15;  x *= 0x31848babu;
      x ^= x >> 14;  return x;
    }
  `
})


const util = {
  const arr = (
    size /*: number*/,
    callback /*?: ((index: number) => any) | any*/,
  ) /*: any[]*/ => {
    const arr = Array(size);
    if (typeof callback !== 'function') {
      return arr.fill(callback);
    }
    return arr.fill(null).map((_, i) => callback(i));
  };
  
  const arr2d = (
    m /*: number */,
    n /*: number */,
    callback /*: (i: number, j: number) => any */,
  ) => {
    return arr(m, (i /*: number*/) => arr(n, (j /*: number*/) => callback(i, j)));
  };

  const rand = (min = 1, max /*?: number*/) => {
    if (max === undefined) {
      return Math.random() * min;
    }
    return Math.random() * (max - min) + min;
  }
  // rand int
  const randi = (max /*: number*/) => Math.floor(Math.random() * max);

  // lerp
  const lerp = (min, max, x) => (max - min) * x + min;
  const scale = (dmin, dmax, rmin, rmax) => value => lerp(rmin, rmax, (value - dmin) / (dmax - dmin));

  // prettier-ignore
  const MAT4X4_IDENTITY = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
  
  const util = {
    MAT4X4_IDENTITY,
    arr,
    arr2d,
    flatArr: (size /*: number*/, callback /*?: any*/) => arr(size, callback).flat(),
    flip: (opt1 /*: any*/, opt2 /*: any*/, threshold = 0.5) => {
      return Math.random() < threshold ? opt1 : opt2;
    },
    TWO_PI: 2 * Math.PI,
    rand,
    randi,
    randof: (choices /* : any[] */) => {
      return choices[randi(choices.length)]
    },
    // random signed
    rands: (width = 1) => (Math.random() - 0.5) * 2 * width,
    // from karpathy:
    randn: (mean /*: number*/, variance /*: number*/) => {
      let V1, V2, S;
      do {
        const U1 = Math.random();
        const U2 = Math.random();
        V1 = 2 * U1 - 1;
        V2 = 2 * U2 - 1;
        S = V1 * V1 + V2 * V2;
      } while (S > 1);
      let X = Math.sqrt((-2 * Math.log(S)) / S) * V1;
      X = mean + Math.sqrt(variance) * X;
      return X;
    },
    zeros: (size /*: number*/) => arr(size, 0),
    nearest: (value /*: number*/, step /*: number*/) => Math.floor(value / step) * step, // aka align
    lerp,
    scale,
    // https://stackoverflow.com/a/12043228
    brightness: (hexString, threshold) => {
      const c = hexString.substring(1);      // strip #
      const rgb = parseInt(c, 16);   // convert rrggbb to decimal
      const r = (rgb >> 16) & 0xff;  // extract red
      const g = (rgb >>  8) & 0xff;  // extract green
      const b = (rgb >>  0) & 0xff;  // extract blue
      
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
      return typeof threshold === 'number' ? luma < threshold : luma
    }
  };

  return util;
}