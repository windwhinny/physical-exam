import BaseCanvasRenderer, {
  Color,
  DateData,
  getColor,
  Rect,
  RenderOptions,
} from './BaseCanvasRenderer';

export type FrameOptions = {
  activeDate: Date,
  getDateSet: (rowOffset: number) => DateData[][],
  setActiveMonth: (year: number, month: number) => void,
  activeMonth: [number, number],
  activeDates: [number, number, number][],
  offset: number,
}

export type Cell = {
  date: Date,
  x: number,
  y: number,
}

export {
  getColor,
  Rect,
  DateData,
}

type ExtraStyle = {
  highLight: {
    color: Color,
    backgroundColor: Color,
  },
  note: {
    color: Color,
  }
}

export default class CanvasRenderer extends BaseCanvasRenderer {
  cellSize: Rect;
  cellCSSSize: Rect;
  cells: Cell[] = [];
  extraStyle: ExtraStyle;

  constructor(
    ctx: CanvasRenderingContext2D,
    options: RenderOptions,
    style: ExtraStyle) {
    super(ctx, options);
    this.extraStyle = style;
  }

  render(frameOptions: FrameOptions) {

    this.cellSize = {
      width: this.canvasWidth / 7,
      height: this.canvasHeight / 6,
    }
    this.cellCSSSize = {
      width: this.canvasWidth / 7 / devicePixelRatio,
      height: this.canvasHeight / 6 / devicePixelRatio,
    }

    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.cells = this.renderDates(frameOptions);
  }

  renderDates(frameOptions: FrameOptions) {
    let offset = frameOptions.offset;
    const cellSize = this.cellSize;
    let rowOffset = Math.round(offset / cellSize.height) + 1;
    offset -= (rowOffset) * cellSize.height;
    const dataSet = frameOptions.getDateSet(rowOffset);
    const activeMonth = frameOptions.activeMonth;
    const unactiveColor = this.options.style.color.slice() as Color;
    const activeDate = frameOptions.activeDate;
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
          this.drawCircle(x, y, Math.min(cellSize.height, cellSize.width) * 0.3, unactiveColor);
          this.drawText(String(date), x, y, this.extraStyle.highLight.color);
        }

        if (frameOptions.activeDates.find(a => a[0] === year && a[1] === month && a[2] === date)) {
          this.drawCircle(x, y - cellSize.height * 0.4, this.options.style.fontSize * 0.3, this.extraStyle.note.color);
        }

        // 高亮选中日期
        if (year === ad[0] && month === ad[1] && date === ad[2]) {
          this.drawCircle(
            x,
            y,
            Math.min(cellSize.height, cellSize.width) * 0.3,
            this.extraStyle.highLight.backgroundColor);
          this.drawText(
            String(date),
            x,
            y,
            this.extraStyle.highLight.color);
        }

        // 当下个月的 15 号移动到屏幕中央时，高亮
        if (Math.abs(y - this.canvasHeight / 2) < cellSize.height && date === 15 && d.disabled) {
          frameOptions.setActiveMonth(year, month);
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
