import {create} from "./documentUtils";

const CSS = {
  resizedColumn: 'tc-table__resize_column'
};

export class Resize {
  constructor(table) {
    this.table = table;
    this.init();
    
    this.active = null;
    this.activeIndex = 0;
    this.startX = 0;
    this.x = 0;
  }
  
  init() {
    document.addEventListener('mousemove', this.onDrag, false);
    document.addEventListener('mouseup', this.onDragEnd, false);
  }
  
  createElem(index) {
    const elem = create('div', [ CSS.resizedColumn ]);
    elem.addEventListener('mousedown', this.onDragStart(index), false);
    return elem;
  }
  
  onDragStart = (index) => (e) => {
    this.startX = e.pageX;
    this.active = e.target;
    this.activeIndex = index;
    this.width = this.table.offsetWidth;
    const [w1, w2] = this.getWidthCols();
    this.widthFirst = w1;
    this.widthSecond = w2;
    
    document.body.style.cursor = 'col-resize';
  
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
  }
  
  onDrag = (e) => {
    if (this.active) {
      this.move(e.pageX - this.startX);
    }
  }
  
  onDragEnd = () => {
    this.active = null;
    document.body.style.cursor = 'auto';
  }
  
  move = (delta) => {
    const [first, second] = this.getCols();
    first.style.width = `${((this.widthFirst / this.width) + (delta / this.width)) * 100}%`
    second.style.width = `${((this.widthSecond / this.width) - (delta / this.width)) * 100}%`
  }
  
  getCols = () => {
    const cells = this.table.rows[0].children;
    const first = cells[this.activeIndex - 1];
    const second = cells[this.activeIndex];
    return [first, second];
  }
  
  getWidthCols = () => {
    const [first, second] = this.getCols()
    return [first.offsetWidth, second.offsetWidth];
  }
}
