import BaseCanvasRenderer, {
  Rect,
  RenderOptions,
  toColorStr,
} from '../BaseCanvasRenderer';

export type FrameOptions = {
  getDateSet: () => Date[],
  activeDate: Date,
  offset: number,
  activeDates: [number, number, number][],
}

export type Cell = {
  date: Date,
  x: number,
  y: number,
}

const layout = [100, 100, 100, 100, 140, 100, 100, 100, 100];
const layoutWidth = 800;
const layoutHeigh = 170;
const start = (layoutWidth - layout.reduce((r, n) => r + n, 0)) / 2;
// const end = layoutWidth - start;
export default class CanvasRenderer extends BaseCanvasRenderer {
  cellSize: Rect;
  scale: number;
  step: number;

  constructor(ctx: CanvasRenderingContext2D, options: RenderOptions) {
    super(ctx, options);

    this.scale = this.canvasWidth / layoutWidth;
    this.step = 100 * this.scale / devicePixelRatio;
  }

  drawDecorator(x: number, y: number) {
    const ctx = this.ctx;
    const scale = this.scale;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = toColorStr([83, 147, 255, 1]);
    ctx.arc(x, y - 3 * scale, 3 * scale, 0, Math.PI, true);
    ctx.arc(x, y + 3 * scale, 3 * scale, Math.PI, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  render(frameOptions: FrameOptions) {
    const cells: Cell[] = [];
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    const offset = frameOptions.offset;
    const dates = frameOptions.getDateSet();
    dates.forEach((d, i) => {
      let width = 0;
      let left = start;
      const year = d.getFullYear();
      const month = d.getMonth();
      const date = d.getDate();
      const active = !!frameOptions.activeDates.find(a =>
        a[0] === year &&
        a[1] === month &&
        a[2] === date
        );
      for (let [k, v] of layout.entries()) {
        if (k === i) {
          width = v;
          break;
        }
        left += v;
      }
      const x = (left + width / 2) * this.scale;
      const y = 130 * this.scale;
      this.drawText(String(d.getDate()), x + offset, y);
      if (active) {
        this.drawCircle(x + offset, y - 30 * this.scale, 5 * this.scale);
      }
      cells.push({
        date: d,
        x: x / (devicePixelRatio),
        y: y / (devicePixelRatio),
      })
    });

    ctx.clearRect(
      (400 + start) * this.scale,
      0,
      140 * this.scale,
      layoutHeigh * this.scale,
    );

    const centerX = (470 + start) * this.scale;
    const centerY = 70 * this.scale;

    this.drawCircle(
      centerX, centerY,
      70 * this.scale,
      [255, 255, 255, 0.5],
    );

    this.drawCircle(
      centerX, centerY,
      60 * this.scale,
      [255, 255, 255, 1],
    );

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60 * this.scale, 0, Math.PI * 2);
    ctx.clip();
    this.setFont({
      size: this.options.style.fontSize * 2,
      family: this.options.style.fontFamily,
      weight: this.options.style.fontWeight,
    });
    dates.slice(3, 6).forEach((d, i) => {
      this.drawText(
        String(d.getDate()),
        (i - 1) * 100 * this.scale  + centerX + offset,
        centerY,
        [83, 147, 255, 1],
      );
    });
    ctx.restore();
    ctx.save();
    this.drawDecorator(centerX - 60 * this.scale, centerY);
    this.drawDecorator(centerX + 60 * this.scale, centerY);
    ctx.restore();
    return cells;
  }
}
