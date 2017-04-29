import React = require('react');
import {
  bindMethod,
} from '../../../lib/utils';
import { oneDay } from '../../../lib/date';
import {
  DataSetGetter,
  CommonCalendarProps,
} from './types';
import {
  isSomeDay
} from '../../../lib/date';
import CanvasRenderer, {
  CanvasStyle,
  DateData,
  getColor,
  Cell,
  Rect,
} from './canvasRenderer';

require('./index.scss');

type State = {
  dates: DateData[][],
  wrapperSize?: ClientRect,
  ctx: CanvasRenderingContext2D | null,
  style?: CanvasStyle,
  activeMonth: [number, number],
  offset: number,
  baseDate: Date,
}

type Props = CommonCalendarProps;

export {
  DataSetGetter,
}

export default class Calendar extends React.Component<Props, State> {
  dates: DateData[][] = [];
  cells: Cell[] | null = null;
  cellSize: Rect | null = null;
  lastTouchPoint: number | null = null;
  constructor(props: Props) {
    super(props);
    const date = props.date;
    this.state = {
      baseDate: date,
      offset: 0,
      ctx: null,
      dates: [],
      activeMonth: [date.getFullYear(), date.getMonth()]
    }

    bindMethod(this, [
      'renderCanvas',
      'touchStart',
      'touchMove',
      'touchEnd',
      'generateDates',
      'setActiveMonth',
      'onCanvasClick',
    ]);
  }

  componentWillReceiveProps(newProps: Props, oldProps: Props) {
    if (newProps.activeMonth === oldProps.activeMonth) return;
    if (!newProps.activeMonth) return;
    this.setState({
      activeMonth: newProps.activeMonth,
    });
  }

  generateDates(rowOffset: number) {
    const dates: DateData[][] = [];
    const am = this.state.activeMonth;
    const year = this.state.baseDate.getFullYear();
    const month = this.state.baseDate.getMonth();
    const startOfBaseMonth = new Date(year, month, 1);

    const startOfActivedMonth = new Date(am[0], am[1], 1);
    const endOfActivedMonth = new Date(am[0], am[1] + 1, 0);

    const offset = startOfBaseMonth.getDay() - 1;
    const startOfData = new Date(year, month, -offset - (7 * rowOffset));
    for (let i = 0; i < 8; i++) {
      let row: DateData[] = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(startOfData.getTime() + oneDay * (i * 7 +  j));
        row.push({
          date,
          disabled: date < startOfActivedMonth || date > endOfActivedMonth,
          haveData: false,
        });
      }
      dates.push(row);
    }

    return dates;
  }

  componentDidMount() {
    const wrapper = this.refs.wrapper as HTMLDivElement;
    const rect = wrapper.getBoundingClientRect();
    this.setState({
      wrapperSize: rect,
    });
  }

  getCanvasStyle() {
    const { wrapperSize } = this.state;
    const width = wrapperSize ? wrapperSize.width : 0;
    const height = wrapperSize ? wrapperSize.height : 0;
    return {
      width: `${width}px`,
      height: `${height}px`,
    }
  }

  getCanvasSize() {
    const { wrapperSize } = this.state;
    return {
      width: (wrapperSize ? wrapperSize.width : 0) * devicePixelRatio,
      height: (wrapperSize ? wrapperSize.height : 0) * devicePixelRatio,
    }
  }

  initCanvas() {
    const canvas = this.refs.canvas as HTMLCanvasElement;
    const style = getComputedStyle(canvas);
    const ctx = canvas.getContext('2d');
    this.setState({
      ctx,
      style: {
        fontFamily: style.fontFamily || '',
        fontSize: Number((style.fontSize || '').replace('px', '')),
        color: getColor(style.color || ''),
      },
    });
  }

  renderCanvas() {
    const { ctx, style, activeMonth, offset } = this.state;
    const { date } = this.props;
    if (!this.refs.canvas) return;
    if (!style || !ctx) {
      this.initCanvas();
      return;
    };
    const renderer = new CanvasRenderer(ctx, {
      activeDate: date,
      activeMonth,
      style,
      offset,
      getDateSet: this.generateDates,
      setActiveMonth: this.setActiveMonth,
    });
    this.cells = renderer.cells;
    this.cellSize = renderer.cellCSSSize;
  }

  setActiveMonth(year: number, month: number) {
    if (this.props.onHoveredMonthChanged) {
      this.props.onHoveredMonthChanged(year, month);
    }

    this.setState({
      activeMonth: [year, month],
    });
  }

  touchStart(e: React.TouchEvent<HTMLDivElement>) {
    const point = e.touches[0].clientY;
    this.lastTouchPoint = point;
  }

  touchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (this.lastTouchPoint === null) return;
    const point = e.touches[0].clientY;
    const offset = (point - this.lastTouchPoint) * devicePixelRatio;
    this.setState({
      offset: this.state.offset + offset,
    });
    this.lastTouchPoint = point;
  }

  touchEnd(e: React.TouchEvent<HTMLDivElement>) {
    this.lastTouchPoint = null;
    e;
  }

  onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!this.cells || !this.cellSize) return;
    const cellSize = this.cellSize;
    const canvas = e.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log(x, y)
    const cell = this.cells.find(c => {
      return Math.abs(x - c.x) < cellSize.width / 2 &&
             Math.abs(y - c.y) < cellSize.height / 2;
    });
    if (!cell) return;
    if (isSomeDay(cell.date, this.props.date)) return;
    if (this.props.onSelectedDateChanged) {
      this.props.onSelectedDateChanged(cell.date);
    }
  }

  render() {
    const { wrapperSize } = this.state;
    const size = this.getCanvasSize();
    requestAnimationFrame(this.renderCanvas);
    return <div className="calendar" ref="container"
    onTouchStart={this.touchStart}
    onTouchMove={this.touchMove}
    onTouchEnd={this.touchEnd}
    >
      <ul className="calendar-header">
        <li>日</li>
        <li>一</li>
        <li>二</li>
        <li>三</li>
        <li>四</li>
        <li>五</li>
        <li>六</li>
      </ul>
      <div className="canvas-wrapper" ref="wrapper">
        { wrapperSize &&
          <canvas
            ref="canvas"
            style={this.getCanvasStyle()}
            width={size.width}
            height={size.height}
            onClick={this.onCanvasClick}
          ></canvas> }
      </div>
    </div>;
  }
}
