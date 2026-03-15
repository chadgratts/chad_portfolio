import { useEffect, useRef } from 'react';

// Based on Pavel Dobryakov's WebGL Fluid Simulation (MIT License)
// https://github.com/PavelDoGreat/WebGL-Fluid-Simulation

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const config = {
  SIM_RESOLUTION: isMobile ? 48 : 128,
  DYE_RESOLUTION: isMobile ? 384 : 1024,
  DENSITY_DISSIPATION: 1.0,
  VELOCITY_DISSIPATION: 0.2,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: isMobile ? 8 : 20,
  CURL: 30,
  SPLAT_RADIUS: 0.25,
  SPLAT_FORCE: 6000,
  SHADING: !isMobile,
  BLOOM: false,
  BLOOM_ITERATIONS: 8,
  BLOOM_RESOLUTION: 256,
  BLOOM_INTENSITY: 0.8,
  BLOOM_THRESHOLD: 0.6,
  BLOOM_SOFT_KNEE: 0.7,
  BACK_COLOR: { r: 255, g: 255, b: 255 },
  COLOR_UPDATE_SPEED: 10,
  COLORFUL: true,
};

const baseVertexShader = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const blurVertexShader = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  uniform vec2 texelSize;
  void main () {
    vUv = aPosition * 0.5 + 0.5;
    float offset = 1.33333333;
    vL = vUv - texelSize * offset;
    vR = vUv + texelSize * offset;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const blurShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  uniform sampler2D uTexture;
  void main () {
    vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
    sum += texture2D(uTexture, vL) * 0.35294117;
    sum += texture2D(uTexture, vR) * 0.35294117;
    gl_FragColor = sum;
  }
`;

const copyShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;

const clearShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const colorShader = `
  precision mediump float;
  uniform vec4 color;
  void main () {
    gl_FragColor = color;
  }
`;

const displayShaderSource = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uTexture;
  uniform sampler2D uBloom;
  uniform vec2 texelSize;

  vec3 linearToGamma (vec3 color) {
    color = max(color, vec3(0));
    return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
  }

  void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
      vec3 lc = texture2D(uTexture, vL).rgb;
      vec3 rc = texture2D(uTexture, vR).rgb;
      vec3 tc = texture2D(uTexture, vT).rgb;
      vec3 bc = texture2D(uTexture, vB).rgb;

      float dx = length(rc) - length(lc);
      float dy = length(tc) - length(bc);

      vec3 n = normalize(vec3(dx, dy, length(texelSize)));
      vec3 l = vec3(0.0, 0.0, 1.0);

      float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
      c *= diffuse;
    #endif

    #ifdef BLOOM
      vec3 bloom = texture2D(uBloom, vUv).rgb;
      bloom = linearToGamma(bloom);
      c += bloom;
    #endif

    float intensity = length(c) * 1.2;
    intensity = clamp(intensity, 0.0, 0.7);
    vec3 ink = normalize(c + 0.0001) * 0.85 + 0.15;
    vec3 result = mix(vec3(1.0), ink, intensity);
    gl_FragColor = vec4(result, 1.0);
  }
`;

const bloomPrefilterShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform vec3 curve;
  uniform float threshold;
  void main () {
    vec3 c = texture2D(uTexture, vUv).rgb;
    float br = max(c.r, max(c.g, c.b));
    float rq = clamp(br - curve.x, 0.0, curve.y);
    rq = curve.z * rq * rq;
    c *= max(rq, br - threshold) / max(br, 0.0001);
    gl_FragColor = vec4(c, 0.0);
  }
`;

const bloomBlurShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uTexture;
  void main () {
    vec4 sum = vec4(0.0);
    sum += texture2D(uTexture, vL);
    sum += texture2D(uTexture, vR);
    sum += texture2D(uTexture, vT);
    sum += texture2D(uTexture, vB);
    sum *= 0.25;
    gl_FragColor = sum;
  }
`;

const bloomFinalShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uTexture;
  uniform float intensity;
  void main () {
    vec4 sum = vec4(0.0);
    sum += texture2D(uTexture, vL);
    sum += texture2D(uTexture, vR);
    sum += texture2D(uTexture, vT);
    sum += texture2D(uTexture, vB);
    sum *= 0.25;
    gl_FragColor = sum * intensity;
  }
`;

const splatShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const advectionShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform vec2 dyeTexelSize;
  uniform float dt;
  uniform float dissipation;

  vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }

  void main () {
    #ifdef MANUAL_FILTERING
      vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
      vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
      vec4 result = texture2D(uSource, coord);
    #endif
    float decay = 1.0 + dissipation * dt;
    gl_FragColor = result / decay;
  }
`;

const divergenceShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) { L = -C.x; }
    if (vR.x > 1.0) { R = -C.x; }
    if (vT.y > 1.0) { T = -C.y; }
    if (vB.y < 0.0) { B = -C.y; }
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

const curlShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`;

const vorticityShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = min(max(velocity, -1000.0), 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const pressureShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float C = texture2D(uPressure, vUv).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

const gradientSubtractShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity.xy -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/*  WebGL Helpers                                                      */
/* ------------------------------------------------------------------ */

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

interface GLProgram {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation>;
  bind: () => void;
}

function getWebGLContext(canvas: HTMLCanvasElement) {
  const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

  const gl2 = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
  const isWebGL2 = !!gl2;
  const gl: WebGLRenderingContext = gl2 || canvas.getContext('webgl', params) as WebGLRenderingContext;
  if (!gl) throw new Error('WebGL not supported');

  let halfFloatTexType: number;
  let supportLinearFiltering: boolean;

  if (isWebGL2) {
    (gl as WebGL2RenderingContext).getExtension('EXT_color_buffer_float');
    supportLinearFiltering = !!(gl as WebGL2RenderingContext).getExtension('OES_texture_float_linear');
    halfFloatTexType = (gl as WebGL2RenderingContext).HALF_FLOAT;
  } else {
    const hf = gl.getExtension('OES_texture_half_float');
    supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
    halfFloatTexType = hf ? hf.HALF_FLOAT_OES : gl.FLOAT;
  }

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  const formatRGBA = isWebGL2
    ? getSupportedFormat(gl as WebGL2RenderingContext, (gl as WebGL2RenderingContext).RGBA16F, gl.RGBA, halfFloatTexType, isWebGL2)
    : { internalFormat: gl.RGBA, format: gl.RGBA };
  const formatRG = isWebGL2
    ? getSupportedFormat(gl as WebGL2RenderingContext, (gl as WebGL2RenderingContext).RG16F, (gl as WebGL2RenderingContext).RG, halfFloatTexType, isWebGL2)
    : { internalFormat: gl.RGBA, format: gl.RGBA };
  const formatR = isWebGL2
    ? getSupportedFormat(gl as WebGL2RenderingContext, (gl as WebGL2RenderingContext).R16F, (gl as WebGL2RenderingContext).RED, halfFloatTexType, isWebGL2)
    : { internalFormat: gl.RGBA, format: gl.RGBA };

  return { gl, isWebGL2, halfFloatTexType, supportLinearFiltering, formatRGBA, formatRG, formatR };
}

function getSupportedFormat(
  gl: WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number,
  _isWebGL2: boolean,
): { internalFormat: number; format: number } {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    switch (internalFormat) {
      case gl.R16F: return getSupportedFormat(gl, gl.RG16F, gl.RG, type, _isWebGL2);
      case gl.RG16F: return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type, _isWebGL2);
      default: return { internalFormat: gl.RGBA, format: gl.RGBA };
    }
  }
  return { internalFormat, format };
}

function supportRenderTextureFormat(gl: WebGLRenderingContext, internalFormat: number, format: number, type: number) {
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status === gl.FRAMEBUFFER_COMPLETE;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string, isWebGL2: boolean, keywords?: string[]) {
  let src = source;
  if (keywords) {
    let kw = '';
    keywords.forEach(k => { kw += '#define ' + k + '\n'; });
    src = kw + src;
  }

  if (isWebGL2) {
    src = src
      .replace(/varying /g, type === gl.VERTEX_SHADER ? 'out ' : 'in ')
      .replace(/attribute /g, 'in ')
      .replace(/texture2D/g, 'texture')
      .replace(/gl_FragColor/g, 'fragColor');
    if (type === gl.FRAGMENT_SHADER) {
      src = src.replace('precision highp float;', 'precision highp float;\nout vec4 fragColor;');
      src = src.replace('precision mediump float;', 'precision mediump float;\nout vec4 fragColor;');
    }
    src = '#version 300 es\n' + src;
  }

  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createGLProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): GLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
  }
  const uniforms: Record<string, WebGLUniformLocation> = {};
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformCount; i++) {
    const info = gl.getActiveUniform(program, i)!;
    uniforms[info.name] = gl.getUniformLocation(program, info.name)!;
  }
  return { program, uniforms, bind() { gl.useProgram(program); } };
}

function createFBO(gl: WebGLRenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
  gl.activeTexture(gl.TEXTURE0);
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return {
    texture, fbo, width: w, height: h, texelSizeX: 1.0 / w, texelSizeY: 1.0 / h,
    attach(id: number) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, texture); return id; }
  };
}

function createDoubleFBO(gl: WebGLRenderingContext, w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
  let fbo1 = createFBO(gl, w, h, internalFormat, format, type, param);
  let fbo2 = createFBO(gl, w, h, internalFormat, format, type, param);
  return {
    width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
    get read() { return fbo1; }, set read(v) { fbo1 = v; },
    get write() { return fbo2; }, set write(v) { fbo2 = v; },
    swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; }
  };
}

function resizeFBO(gl: WebGLRenderingContext, copyProg: GLProgram, blitFn: (t: FBO | null) => void, target: FBO, w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
  const newFBO = createFBO(gl, w, h, internalFormat, format, type, param);
  copyProg.bind();
  gl.uniform1i(copyProg.uniforms.uTexture, target.attach(0));
  blitFn(newFBO);
  return newFBO;
}

function resizeDoubleFBO(gl: WebGLRenderingContext, copyProg: GLProgram, blitFn: (t: FBO | null) => void, target: DoubleFBO, w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
  if (target.width === w && target.height === h) return target;
  target.read = resizeFBO(gl, copyProg, blitFn, target.read, w, h, internalFormat, format, type, param);
  target.write = createFBO(gl, w, h, internalFormat, format, type, param);
  target.width = w;
  target.height = h;
  target.texelSizeX = 1.0 / w;
  target.texelSizeY = 1.0 / h;
  return target;
}

function HSVtoRGB(h: number, s: number, v: number) {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r, g, b };
}

function generateColor() {
  // Curated hue ranges: reds/pinks (0.9-1.0, 0.0-0.05), magentas/purples (0.7-0.9), blues/teals (0.5-0.7)
  const ranges = [
    [0.0, 0.05],   // red
    [0.28, 0.38],  // bright green / neon green
    [0.52, 0.7],   // blue / teal
    [0.7, 0.85],   // purple / magenta
    [0.9, 1.0],    // pink / red
  ];
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  const h = range[0] + Math.random() * (range[1] - range[0]);
  const c = HSVtoRGB(h, 0.9, 1.0);
  c.r *= 0.15;
  c.g *= 0.15;
  c.b *= 0.15;
  return c;
}

function correctRadius(radius: number, aspectRatio: number) {
  if (aspectRatio > 1) radius *= aspectRatio;
  return radius;
}

function correctDeltaX(delta: number, aspectRatio: number) {
  if (aspectRatio < 1) delta *= aspectRatio;
  return delta;
}

function correctDeltaY(delta: number, aspectRatio: number) {
  if (aspectRatio > 1) delta /= aspectRatio;
  return delta;
}

function getResolution(gl: WebGLRenderingContext, resolution: number) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
  const min = Math.round(resolution);
  const max = Math.round(resolution * aspectRatio);
  if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
  else return { width: min, height: max };
}

function scaleByPixelRatio(input: number) {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}

function hashCode(s: string) {
  if (s.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/* ------------------------------------------------------------------ */
/*  React Component                                                    */
/* ------------------------------------------------------------------ */

export default function FluidSimulation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let contextLost = false;

    function onContextLost(e: Event) {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(animId);
    }

    function onContextRestored() {
      contextLost = false;
      // Re-init will happen on next useEffect cycle
      window.location.reload();
    }

    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    try {
      const { gl, isWebGL2, halfFloatTexType, supportLinearFiltering, formatRGBA, formatRG, formatR } = getWebGLContext(canvas);

      const filtering = supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      // Blit setup
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      const blit = (target: FBO | null) => {
        if (target) {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        } else {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };

      // Compile all shaders
      const baseVS = compileShader(gl, gl.VERTEX_SHADER, baseVertexShader, isWebGL2);
      const blurVS = compileShader(gl, gl.VERTEX_SHADER, blurVertexShader, isWebGL2);

      const mkProg = (vs: WebGLShader, fsSrc: string, kw?: string[]) =>
        createGLProgram(gl, vs, compileShader(gl, gl.FRAGMENT_SHADER, fsSrc, isWebGL2, kw));

      const blurProgram = mkProg(blurVS, blurShader);
      const copyProgram = mkProg(baseVS, copyShader);
      const clearProgram = mkProg(baseVS, clearShader);
      const colorProgram = mkProg(baseVS, colorShader);
      const splatProgram = mkProg(baseVS, splatShader);
      const advectionProgram = mkProg(baseVS, advectionShader, supportLinearFiltering ? undefined : ['MANUAL_FILTERING']);
      const divergenceProgram = mkProg(baseVS, divergenceShader);
      const curlProgram = mkProg(baseVS, curlShader);
      const vorticityProgram = mkProg(baseVS, vorticityShader);
      const pressureProgram = mkProg(baseVS, pressureShader);
      const gradSubtractProgram = mkProg(baseVS, gradientSubtractShader);
      const bloomPrefilterProgram = mkProg(baseVS, bloomPrefilterShader);
      const bloomBlurProgram = mkProg(baseVS, bloomBlurShader);
      const bloomFinalProgram = mkProg(baseVS, bloomFinalShader);

      // Display material with keyword switching
      const displayPrograms: Record<number, GLProgram> = {};
      function getDisplayProgram(keywords: string[]) {
        let hash = 0;
        keywords.forEach(k => { hash += hashCode(k); });
        if (!displayPrograms[hash]) {
          displayPrograms[hash] = mkProg(baseVS, displayShaderSource, keywords);
        }
        return displayPrograms[hash];
      }

      const displayKeywords: string[] = [];
      if (config.SHADING) displayKeywords.push('SHADING');
      if (config.BLOOM) displayKeywords.push('BLOOM');

      // Init framebuffers
      const simRes = getResolution(gl, config.SIM_RESOLUTION);
      const dyeRes = getResolution(gl, config.DYE_RESOLUTION);

      let dye = createDoubleFBO(gl, dyeRes.width, dyeRes.height, formatRGBA!.internalFormat, formatRGBA!.format, halfFloatTexType, filtering);
      let velocity = createDoubleFBO(gl, simRes.width, simRes.height, formatRG!.internalFormat, formatRG!.format, halfFloatTexType, filtering);
      let divergenceFBO = createFBO(gl, simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);
      let curlFBO = createFBO(gl, simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);
      let pressure = createDoubleFBO(gl, simRes.width, simRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);

      // Bloom framebuffers
      let bloomFBO: FBO;
      let bloomFramebuffers: FBO[] = [];

      function initBloomFramebuffers() {
        const res = getResolution(gl, config.BLOOM_RESOLUTION);
        bloomFBO = createFBO(gl, res.width, res.height, formatRGBA!.internalFormat, formatRGBA!.format, halfFloatTexType, filtering);
        bloomFramebuffers = [];
        for (let i = 0; i < config.BLOOM_ITERATIONS; i++) {
          const w = res.width >> (i + 1);
          const h = res.height >> (i + 1);
          if (w < 2 || h < 2) break;
          bloomFramebuffers.push(createFBO(gl, w, h, formatRGBA!.internalFormat, formatRGBA!.format, halfFloatTexType, filtering));
        }
      }
      initBloomFramebuffers();

      function initFramebuffers() {
        const sRes = getResolution(gl, config.SIM_RESOLUTION);
        const dRes = getResolution(gl, config.DYE_RESOLUTION);
        dye = resizeDoubleFBO(gl, copyProgram, blit, dye, dRes.width, dRes.height, formatRGBA!.internalFormat, formatRGBA!.format, halfFloatTexType, filtering);
        velocity = resizeDoubleFBO(gl, copyProgram, blit, velocity, sRes.width, sRes.height, formatRG!.internalFormat, formatRG!.format, halfFloatTexType, filtering);
        divergenceFBO = createFBO(gl, sRes.width, sRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);
        curlFBO = createFBO(gl, sRes.width, sRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);
        pressure = createDoubleFBO(gl, sRes.width, sRes.height, formatR!.internalFormat, formatR!.format, halfFloatTexType, gl.NEAREST);
        initBloomFramebuffers();
      }

      // Pointer state
      interface Pointer {
        id: number; texcoordX: number; texcoordY: number;
        prevTexcoordX: number; prevTexcoordY: number;
        deltaX: number; deltaY: number;
        down: boolean; moved: boolean;
        color: { r: number; g: number; b: number };
      }

      const pointers: Pointer[] = [{
        id: -1, texcoordX: 0, texcoordY: 0,
        prevTexcoordX: 0, prevTexcoordY: 0,
        deltaX: 0, deltaY: 0,
        down: false, moved: false,
        color: { r: 30, g: 0, b: 300 }
      }];

      let colorUpdateTimer = 0;

      // Splat
      function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
        splatProgram.bind();
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas!.width / canvas!.height);
        gl.uniform2f(splatProgram.uniforms.point, x, y);
        gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
        gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0, canvas!.width / canvas!.height));
        blit(velocity.write);
        velocity.swap();

        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
        blit(dye.write);
        dye.swap();
      }

      function multipleSplats(amount: number) {
        for (let i = 0; i < amount; i++) {
          const color = generateColor();
          color.r *= 10.0;
          color.g *= 10.0;
          color.b *= 10.0;
          const x = Math.random();
          const y = Math.random();
          const dx = 1000 * (Math.random() - 0.5);
          const dy = 1000 * (Math.random() - 0.5);
          splat(x, y, dx, dy, color);
        }
      }

      function splatPointer(p: Pointer) {
        const force = p.id >= 0 ? config.SPLAT_FORCE * 5 : config.SPLAT_FORCE;
        const dx = p.deltaX * force;
        const dy = p.deltaY * force;
        splat(p.texcoordX, p.texcoordY, dx, dy, p.color);
      }

      // Bloom
      function applyBloom(source: FBO, destination: FBO) {
        if (bloomFramebuffers.length < 2) return;
        let last: FBO = destination;
        gl.disable(gl.BLEND);
        bloomPrefilterProgram.bind();
        const knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
        const curve0 = config.BLOOM_THRESHOLD - knee;
        const curve1 = knee * 2;
        const curve2 = 0.25 / knee;
        gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
        gl.uniform1f(bloomPrefilterProgram.uniforms.threshold, config.BLOOM_THRESHOLD);
        gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
        blit(last);

        bloomBlurProgram.bind();
        for (let i = 0; i < bloomFramebuffers.length; i++) {
          const dest = bloomFramebuffers[i];
          gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
          gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
          blit(dest);
          last = dest;
        }

        gl.blendFunc(gl.ONE, gl.ONE);
        gl.enable(gl.BLEND);

        for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
          const baseTex = bloomFramebuffers[i];
          gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
          gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
          gl.viewport(0, 0, baseTex.width, baseTex.height);
          blit(baseTex);
          last = baseTex;
        }

        gl.disable(gl.BLEND);
        bloomFinalProgram.bind();
        gl.uniform2f(bloomFinalProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
        gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
        blit(destination);
      }

      // Resize
      function resizeCanvas() {
        const w = scaleByPixelRatio(canvas!.clientWidth);
        const h = scaleByPixelRatio(canvas!.clientHeight);
        if (canvas!.width !== w || canvas!.height !== h) {
          canvas!.width = w;
          canvas!.height = h;
          initFramebuffers();
        }
      }

      // Step
      function step(dt: number) {
        gl.disable(gl.BLEND);

        curlProgram.bind();
        gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(curlFBO);

        vorticityProgram.bind();
        gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(vorticityProgram.uniforms.uCurl, curlFBO.attach(1));
        gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
        gl.uniform1f(vorticityProgram.uniforms.dt, dt);
        blit(velocity.write);
        velocity.swap();

        divergenceProgram.bind();
        gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergenceFBO);

        clearProgram.bind();
        gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
        gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
        blit(pressure.write);
        pressure.swap();

        pressureProgram.bind();
        gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(pressureProgram.uniforms.uDivergence, divergenceFBO.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
          gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
          blit(pressure.write);
          pressure.swap();
        }

        gradSubtractProgram.bind();
        gl.uniform2f(gradSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(gradSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(gradSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write);
        velocity.swap();

        advectionProgram.bind();
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        if (!supportLinearFiltering)
          gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
        const velocityId = velocity.read.attach(0);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
        gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
        gl.uniform1f(advectionProgram.uniforms.dt, dt);
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write);
        velocity.swap();

        if (!supportLinearFiltering)
          gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write);
        dye.swap();
      }

      // Render
      function render(target: FBO | null) {
        if (config.BLOOM) applyBloom(dye.read, bloomFBO);

        gl.disable(gl.BLEND);
        drawDisplay(target);
      }

      function drawColor(target: FBO | null, color: { r: number; g: number; b: number }) {
        colorProgram.bind();
        gl.uniform4f(colorProgram.uniforms.color, color.r / 255, color.g / 255, color.b / 255, 1);
        blit(target);
      }

      function drawDisplay(target: FBO | null) {
        const width = target == null ? gl.drawingBufferWidth : target.width;
        const height = target == null ? gl.drawingBufferHeight : target.height;

        const displayProgram = getDisplayProgram(displayKeywords);
        displayProgram.bind();
        if (config.SHADING)
          gl.uniform2f(displayProgram.uniforms.texelSize, 1.0 / width, 1.0 / height);
        gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
        if (config.BLOOM)
          gl.uniform1i(displayProgram.uniforms.uBloom, bloomFBO.attach(1));
        blit(target);
      }

      // Events
      function updatePointerDownData(pointer: Pointer, id: number, posX: number, posY: number) {
        pointer.id = id;
        pointer.down = true;
        pointer.moved = false;
        pointer.texcoordX = posX / canvas!.width;
        pointer.texcoordY = 1.0 - posY / canvas!.height;
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.deltaX = 0;
        pointer.deltaY = 0;
        pointer.color = generateColor();
      }

      function updatePointerMoveData(pointer: Pointer, posX: number, posY: number) {
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.texcoordX = posX / canvas!.width;
        pointer.texcoordY = 1.0 - posY / canvas!.height;
        const aspect = canvas!.width / canvas!.height;
        pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX, aspect);
        pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY, aspect);
        pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
      }

      function onMouseMove(e: MouseEvent) {
        const pointer = pointers[0];
        const posX = scaleByPixelRatio(e.clientX);
        const posY = scaleByPixelRatio(e.clientY);
        if (!pointer.down) {
          pointer.down = true;
          pointer.color = generateColor();
          pointer.texcoordX = posX / canvas!.width;
          pointer.texcoordY = 1.0 - posY / canvas!.height;
          pointer.prevTexcoordX = pointer.texcoordX;
          pointer.prevTexcoordY = pointer.texcoordY;
        }
        updatePointerMoveData(pointer, posX, posY);
      }

      function onMouseDown(e: MouseEvent) {
        const posX = scaleByPixelRatio(e.clientX);
        const posY = scaleByPixelRatio(e.clientY);
        updatePointerDownData(pointers[0], -1, posX, posY);
      }

      function onMouseUp() {
        // Keep pointer active for hover-based interaction
      }

      // Touch handlers for mobile fluid splats (without preventing scroll)
      // Use a single dedicated touch pointer (index 1) to avoid unbounded array growth
      if (pointers.length < 2) {
        pointers.push({
          id: -1, texcoordX: 0, texcoordY: 0,
          prevTexcoordX: 0, prevTexcoordY: 0,
          deltaX: 0, deltaY: 0,
          down: false, moved: false,
          color: { r: 30, g: 0, b: 300 }
        });
      }

      function onTouchStart(e: TouchEvent) {
        const touch = e.targetTouches[0];
        if (!touch) return;
        const posX = scaleByPixelRatio(touch.clientX);
        const posY = scaleByPixelRatio(touch.clientY);
        updatePointerDownData(pointers[1], touch.identifier, posX, posY);
      }

      let lastTouchTime = 0;
      function onTouchMove(e: TouchEvent) {
        const now = Date.now();
        if (now - lastTouchTime < 60) return; // Throttle to ~16Hz
        lastTouchTime = now;
        const touch = e.targetTouches[0];
        if (!touch) return;
        const pointer = pointers[1];
        if (!pointer.down) return;
        const posX = scaleByPixelRatio(touch.clientX);
        const posY = scaleByPixelRatio(touch.clientY);
        updatePointerMoveData(pointer, posX, posY);
      }

      function onTouchEnd() {
        pointers[1].down = false;
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);

      resizeCanvas();
      multipleSplats(isMobile ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 20) + 5);
      let autoSplatTimer = 0;

      let lastUpdateTime = Date.now();

      let splatsThisFrame = 0;
      let frameCount = 0;

      function update() {
        if (contextLost) return;
        frameCount++;
        const now = Date.now();
        let dt = (now - lastUpdateTime) / 1000;
        dt = Math.min(dt, 0.016666);
        lastUpdateTime = now;
        splatsThisFrame = 0;

        
        const w = scaleByPixelRatio(canvas!.clientWidth);
        const h = scaleByPixelRatio(canvas!.clientHeight);
        if (canvas!.width !== w || canvas!.height !== h) {
          canvas!.width = w;
          canvas!.height = h;
          initFramebuffers();
        }

        // Color cycling
        if (config.COLORFUL) {
          colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
          if (colorUpdateTimer >= 1) {
            colorUpdateTimer = ((colorUpdateTimer - 0) % (1 - 0)) + 0;
            pointers.forEach(p => { p.color = generateColor(); });
          }
        }

        // Auto-splat on mobile to keep colors alive
        if (isMobile) {
          autoSplatTimer += dt;
          if (autoSplatTimer >= 3) {
            autoSplatTimer = 0;
            splat(Math.random(), Math.random(), 1000 * (Math.random() - 0.5), 1000 * (Math.random() - 0.5), (() => { const c = generateColor(); c.r *= 10; c.g *= 10; c.b *= 10; return c; })());
            splatsThisFrame++;
          }
        }

        // Apply pointer inputs (max 1 splat per frame on mobile, 2 on desktop)
        const maxSplats = isMobile ? 1 : 2;
        pointers.forEach(p => {
          if (p.moved && splatsThisFrame < maxSplats) {
            p.moved = false;
            splatPointer(p);
            splatsThisFrame++;
          } else if (p.moved) {
            p.moved = false;
          }
        });

        step(dt);
        render(null);
        animId = requestAnimationFrame(update);
      }

      animId = requestAnimationFrame(update);

      return () => {
        cancelAnimationFrame(animId);
        canvas!.removeEventListener('webglcontextlost', onContextLost);
        canvas!.removeEventListener('webglcontextrestored', onContextRestored);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
      };
    } catch (e) {
      console.error('FluidSimulation init failed:', e);
      return () => { if (animId) cancelAnimationFrame(animId); };
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'auto',
      }}
    />
  );
}
