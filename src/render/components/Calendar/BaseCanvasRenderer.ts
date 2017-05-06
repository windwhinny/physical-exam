export type Color = [number, number, number, number];
export type CanvasStyle = {
  fontFamily: string,
  fontSize: number,
  color: Color,
  fontWeight?: string,
}

export type RenderOptions = {
  style: CanvasStyle
}

export type DateData = {
  date: Date,
  disabled: boolean,
}

export type Rect = {
  height: number,
  width: number,
}

export function getColor(str: string): Color {
  if (str.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/)) {
    return [
      parseInt(str.slice(1, 3), 16),
      parseInt(str.slice(3, 5), 16),
      parseInt(str.slice(5, 7), 16),
      Math.round(str.length === 9 ? parseInt(str.slice(7, 8), 16) / 255 : 1),
    ];
  } else if (str.match(/^rgb\(\d+,\s?\d+,\s?\d+\)$/)) {
    const c = str.slice(4, -1).split(',').map(Number);
    c.push(1);
    return c as Color;
  } else if (str.match(/^rgba\(\d+,\s?\d+,\s?\d+,\s?\d+\)$/)) {
    return str.slice(4, -1).split(',').map(Number) as Color;
  }
  return [0, 0, 0, 0];
}

export function toColorStr(color: Color): string {
  return `rgba(${color.join(',')})`;
}

export default class BaseCanvasRenderer {
  canvasWidth: number;
  canvasHeight: number;

  constructor(
    public ctx: CanvasRenderingContext2D,
    public options: RenderOptions) {
    this.canvasWidth = ctx.canvas.width;
    this.canvasHeight = ctx.canvas.height;
    this.setFont({
      size: options.style.fontSize,
      family: options.style.fontFamily,
      weight: options.style.fontWeight,
    });
    ctx.fillStyle = toColorStr(options.style.color);
    ctx.textBaseline = 'middle';
  }

  setFont(options: {
    size: number,
    family: string,
    weight?: string,
  }) {
    this.ctx.font = [
      options.weight || 'normal',
      `${options.size * devicePixelRatio}px`,
      options.family,
    ].join(' ');
  }

  drawText(str: string, x: number, y: number, color?: Color) {
    const ctx = this.ctx;
    ctx.save();
    const strSize = {
      width: ctx.measureText(str).width,
      height: this.options.style.fontSize * devicePixelRatio,
    };
    if (color) {
      const c = toColorStr(color);
      ctx.fillStyle = c;
    }
    const ax = x - strSize.width / 2;
    const ay = y;
    if (
      ax < this.canvasWidth &&
      ax + strSize.width > 0 &&
      ay < this.canvasHeight &&
      ay + strSize.height > 0
    ) {
      ctx.fillText(str, ax, ay);
    }
    ctx.restore();
  }

  drawCircle(x: number, y: number, size: number, color?: Color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    if (color) {
      ctx.fillStyle = toColorStr(color);
    }
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

}
