export type Color = [number, number, number, number];
export type CanvasStyle = {
  fontFamily: string,
  fontSize: number,
  color: Color,
}

export type DateData = {
  date: Date,
  disabled: boolean,
  haveData: boolean,
}

export type RenderOptions = {
  activeDate: Date,
  style: CanvasStyle
  getDateSet: (rowOffset: number) => DateData[][],
  setActiveMonth: (year: number, month: number) => void,
  activeMonth: [number, number],
  offset: number,
}

export type Cell = {
  date: Date,
  x: number,
  y: number,
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

export default class Renderer {
  canvasWidth: number;
  canvasHeight: number;
  cellSize: Rect;
  cellCSSSize: Rect;
  cells: Cell[] = []

  constructor(
    public ctx: CanvasRenderingContext2D,
    public options: RenderOptions) {
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const options = this.options;
    this.canvasWidth = ctx.canvas.width;
    this.canvasHeight = ctx.canvas.height;
    this.cellSize = {
      width: this.canvasWidth / 7,
      height: this.canvasHeight / 6,
    }
    this.cellCSSSize = {
      width: this.canvasWidth / 7 / devicePixelRatio,
      height: this.canvasHeight / 6 / devicePixelRatio,
    }
    ctx.font = `${options.style.fontSize * devicePixelRatio}px ${options.style.fontFamily}`;
    ctx.fillStyle = toColorStr(options.style.color);
    ctx.textBaseline = 'middle';
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.cells = this.renderDates(options.offset);
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

  drawCircle(x: number, y: number, color?: Color) {
    const ctx = this.ctx;
    const cellSize = this.cellSize;
    ctx.save();
    ctx.beginPath();
    if (color) {
      ctx.fillStyle = toColorStr(color);
    }
    ctx.arc(x, y, Math.min(cellSize.height, cellSize.width) * 0.3, 0, Math.PI * 2)
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  renderDates(offset: number) {
    const cellSize = this.cellSize;
    let rowOffset = Math.round(offset / cellSize.height) + 1;
    offset -= (rowOffset) * cellSize.height;
    const dataSet = this.options.getDateSet(rowOffset);
    const activeMonth = this.options.activeMonth;
    const unactiveColor = this.options.style.color.slice() as Color;
    const activeDate = this.options.activeDate;
    const ad = [activeDate.getFullYear(), activeDate.getMonth(), activeDate.getDate()];
    const today = new Date();
    const td = [today.getFullYear(), today.getMonth(), today.getDate()];

    unactiveColor[3] = 0.3 * unactiveColor[3];
    const cells: Cell[] = [];
    dataSet.forEach((row, i) => {
      row.forEach((d, j) => {
        const year = d.date.getFullYear();
        const month = d.date.getMonth();
        const date = d.date.getDate();

        let color: Color | undefined = undefined;
        // 确定日期是否为当前月
        if (year !== activeMonth[0] || month !== activeMonth[1]) {
          color = unactiveColor;
        }

        // 确定日期坐标
        const x = (j + 0.5) * cellSize.width;
        const y = (i + 0.5) * cellSize.height + offset;

        // 绘制日期
        this.drawText(String(date), x, y, color);

        // 高亮今天日期
        if (year === td[0] && month === td[1] && date === td[2]) {
          this.drawCircle(x, y, unactiveColor);
          this.drawText(String(date), x, y, [83, 147, 255, 1]);
        }

        // 高亮选中日期
        if (year === ad[0] && month === ad[1] && date === ad[2]) {
          this.drawCircle(x, y);
          this.drawText(String(date), x, y, [83, 147, 255, 1]);
        }

        // 当下个月的 15 号移动到屏幕中央时，高亮
        if (Math.abs(y - this.canvasHeight / 2) < cellSize.height && date === 15 && d.disabled) {
          this.options.setActiveMonth(year, month);
        }
        cells.push({
          date: d.date,
          x: x / devicePixelRatio,
          y: y / devicePixelRatio,
        })
      });
    });
    return cells;
  }
}
