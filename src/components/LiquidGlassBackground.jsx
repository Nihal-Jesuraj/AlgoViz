import { useEffect, useRef } from 'react';

/* ── Vertex Shader ── */
const VERT = `attribute vec2 position; void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;

/* ── Fragment Shader — Liquid Glass with multi-panel support ── */
const FRAG = `
precision mediump float;

uniform vec3  iResolution;
uniform vec2  uImgRes;
uniform vec4  uPanels[5];   // xy = center (GL coords y-up), zw = half-size
uniform float uPanelRadii[5]; // border-radius per panel (in px)
uniform float uPanelCount;
uniform float uWhite;        // 0..1 glass whiteness
uniform sampler2D iChannel0;

vec2 coverUv(vec2 uv) {
  float ca = iResolution.x / iResolution.y;
  float ia = uImgRes.x   / uImgRes.y;
  vec2  s  = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  const float PWR = 6.0;
  vec2 fc  = gl_FragCoord.xy;
  vec2 uv  = fc / iResolution.xy;
  vec4 bg  = texture2D(iChannel0, coverUv(uv));
  vec4 color = bg;

  for (int i = 0; i < 5; i++) {
    if (float(i) >= uPanelCount) break;
    vec2  center  = uPanels[i].xy;
    vec2  halfSz  = uPanels[i].zw;
    if (halfSz.x < 1.0) continue;

    vec2  d  = (fc - center) / halfSz;
    float rb = pow(abs(d.x), PWR) + pow(abs(d.y), PWR);

    float mask = clamp((1.0 - rb) * 8.0, 0.0, 1.0);
    float edge = clamp((0.955 - rb * 0.95) * 16.0, 0.0, 1.0)
               - clamp((0.91  - rb * 0.95) * 16.0, 0.0, 1.0);
    float glow = clamp((1.5 - rb * 1.1) * 2.0, 0.0, 1.0)
               - clamp((1.0 - rb * 1.1) * 2.0, 0.0, 1.0);

    float transition = smoothstep(0.0, 1.0, mask + edge);
    if (transition <= 0.0) continue;

    vec2 cuv  = center / iResolution.xy;
    vec2 lens = cuv + (uv - cuv) * (1.0 - rb * 0.20);

    // Gaussian-ish blur (7×7 kernel)
    vec4  acc   = vec4(0.0);
    float total = 0.0;
    for (float x = -3.0; x <= 3.0; x += 1.0) {
      for (float y = -3.0; y <= 3.0; y += 1.0) {
        vec2 off = vec2(x, y) * 1.1 / iResolution.xy;
        acc   += texture2D(iChannel0, coverUv(lens + off));
        total += 1.0;
      }
    }
    acc /= total;

    float dy = uv.y - cuv.y;
    float gradient = clamp((clamp(dy, 0.0, 0.2) + 0.1) / 3.0, 0.0, 1.0)
                   + clamp((clamp(-dy, -1000.0, 0.2) * glow + 0.1) / 3.0, 0.0, 1.0);

    vec4 lighting = clamp(acc + vec4(mask) * gradient * 0.3 + vec4(edge) * 0.1, 0.0, 1.0);
    // Mix with a subtle dark purple instead of white for the dark theme glass tint
    lighting = mix(lighting, vec4(0.1, 0.08, 0.15, 1.0), uWhite);
    color = mix(color, lighting, transition);
  }

  gl_FragColor = vec4(color.rgb, 1.0);
}
`;

/* ── Procedural Background Themes ── */
export const THEMES = {
  glass: {
    gradient: ['#0A0A0C', '#121216', '#0E0E12', '#08080A'],
    blobs: [
      { cx: 300,  cy: 200,  r: 500, color: [48, 114, 255, 0.12] },    // Deep blue
      { cx: 1600, cy: 300,  r: 450, color: [255, 48, 144, 0.10] },    // Magenta/Pink
      { cx: 800,  cy: 800,  r: 600, color: [64, 224, 208, 0.08] },    // Turquoise/Cyan
      { cx: 100,  cy: 900,  r: 450, color: [142, 48, 255, 0.12] },    // Deep purple
      { cx: 1200, cy: 700,  r: 500, color: [255, 120, 48, 0.06] },    // Warm subtle orange
    ]
  },
  cyberpunk: {
    gradient: ['#050B14', '#081220', '#030811', '#010408'],
    blobs: [
      { cx: 300,  cy: 200,  r: 500, color: [6, 214, 160, 0.15] },
      { cx: 1600, cy: 300,  r: 400, color: [255, 0, 128, 0.12] },
      { cx: 800,  cy: 800,  r: 600, color: [0, 255, 255, 0.1] },
      { cx: 100,  cy: 900,  r: 450, color: [124, 58, 237, 0.15] },
    ]
  },
  light: { isGraphisual: true },
  dark: { isGraphisual: true },
  blueprint: { isGraphisual: true }
};

export const themeIds = Object.keys(THEMES);

function createBackground(themeId) {
  const theme = THEMES[themeId] || THEMES.glass;
  const W = 1920, H = 1080;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');

  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0.0, theme.gradient[0]);
  g.addColorStop(0.33, theme.gradient[1]);
  g.addColorStop(0.66, theme.gradient[2]);
  g.addColorStop(1.0, theme.gradient[3]);
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);

  for (const b of theme.blobs) {
    const rg = x.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, b.r);
    rg.addColorStop(0, `rgba(${b.color.join(',')})`);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = rg;
    x.fillRect(0, 0, W, H);
  }

  // Subtle noise texture
  const id = x.getImageData(0, 0, W, H);
  for (let i = 0; i < id.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 6;
    id.data[i]     += n;
    id.data[i + 1] += n;
    id.data[i + 2] += n;
  }
  x.putImageData(id, 0, 0);

  return c;
}

/* ── Compile shader helper ── */
function compileShader(gl, type, source) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function LiquidGlassBackground({ themeId = 'glass', bgImage = null }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (['light', 'dark', 'blueprint'].includes(themeId)) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false, antialias: false });
    if (!gl) { console.warn('WebGL not available, falling back to CSS glass.'); return; }

    /* ── Size canvas ── */
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Compile program ── */
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    /* ── Setup Geometry ── */
    const verts = new Float32Array([-1, -1,  1, -1,  -1, 1,  1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    /* ── Uniforms ── */
    const U = {
      resolution: gl.getUniformLocation(program, 'iResolution'),
      imgRes:     gl.getUniformLocation(program, 'uImgRes'),
      panelCount: gl.getUniformLocation(program, 'uPanelCount'),
      texture:    gl.getUniformLocation(program, 'iChannel0'),
      white:      gl.getUniformLocation(program, 'uWhite'),
      panels:     [],
      panelRadii: [],
    };
    for (let i = 0; i < 5; i++) {
      U.panels.push(gl.getUniformLocation(program, `uPanels[${i}]`));
      U.panelRadii.push(gl.getUniformLocation(program, `uPanelRadii[${i}]`));
    }

    /* ── Background texture ── */
    const bgCanvas = createBackground(themeId);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (bgImage) {
      const img = new Image();
      img.onload = () => {
        const x = bgCanvas.getContext('2d');
        const scale = Math.max(bgCanvas.width / img.width, bgCanvas.height / img.height);
        const cw = img.width * scale;
        const ch = img.height * scale;
        const cx = (bgCanvas.width - cw) / 2;
        const cy = (bgCanvas.height - ch) / 2;
        x.drawImage(img, cx, cy, cw, ch);
        
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bgCanvas);
      };
      img.src = bgImage;
    }

    const GLASS_WHITE = themeId === 'light' && !bgImage ? 0.20 : 0.25;

    /* ── Render loop ── */
    function render() {
      const W = canvas.width, H = canvas.height;

      // Find glass panels in the DOM
      const panels = document.querySelectorAll('[data-glass-panel]');
      const count = Math.min(panels.length, 5);

      gl.viewport(0, 0, W, H);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform3f(U.resolution, W, H, 1.0);
      gl.uniform2f(U.imgRes, 1920, 1080);
      gl.uniform1f(U.panelCount, count);
      gl.uniform1f(U.white, GLASS_WHITE);

      for (let i = 0; i < 5; i++) {
        if (i < count) {
          const rect = panels[i].getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = H - (rect.top + rect.height / 2); // GL y-up
          gl.uniform4f(U.panels[i], cx, cy, rect.width / 2 + 6, rect.height / 2 + 6);
          gl.uniform1f(U.panelRadii[i], 20);
        } else {
          gl.uniform4f(U.panels[i], 0, 0, 0, 0);
          gl.uniform1f(U.panelRadii[i], 0);
        }
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(U.texture, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    /* ── Cleanup ── */
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
    };
  }, [themeId, bgImage]);

  return (
    <canvas
      ref={canvasRef}
      id="liquid-glass-bg"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        display: ['light', 'dark', 'blueprint'].includes(themeId) ? 'none' : 'block',
        pointerEvents: 'none',
      }}
    />
  );
}
