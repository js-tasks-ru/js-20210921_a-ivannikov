export default class DoubleSlider {

  element;
  subElements = {};

  getLeftPosition(clientX, rect) {
    if (clientX <= rect.left) {
      return 0;
    } else if (clientX >= rect.left + rect.width) {
      return 100;
    }
    return ((clientX - rect.left) * 100 / rect.width);
  }

  getRightPosition(clientX, rect) {
    if (clientX <= rect.left) {
      return 100;
    } else if (clientX >= rect.left + rect.width) {
      return 0;
    }
    return ((rect.width - clientX + rect.left) * 100 / rect.width);
  }

  adjustLeftPosition(leftPos) {
    const rightPos = +parseFloat(this.subElements.progress.style.right) || 0;
    return leftPos + rightPos <= 100 ? leftPos : 100 - rightPos;
  }

  adjustRightPosition(rightPos) {
    const leftPos = +parseFloat(this.subElements.progress.style.left) || 0;
    return leftPos + rightPos <= 100 ? rightPos : 100 - leftPos;
  }

  updateFrom(percent) {
    this.selected.from = +(this.min + (this.max - this.min) * percent / 100).toFixed(0);
    this.subElements.from.innerHTML = this.formatValue(this.selected.from);
  }

  updateTo(percent) {
    this.selected.to = +(this.max - (this.max - this.min) * percent / 100).toFixed(0);
    this.subElements.to.innerHTML = this.formatValue(this.selected.to);
  }

  setElementsPositions(clientX) {
    const rect = this.subElements?.ruler.getBoundingClientRect();

    if (this.thumb === this.subElements?.thumbLeft) {
      const pos = this.adjustLeftPosition(this.getLeftPosition(clientX, rect));
      this.subElements.thumbLeft.style.left = this.subElements.progress.style.left = pos + '%';
      this.updateFrom(pos);
    } else if (this.thumb === this.subElements?.thumbRight) {
      const pos = this.adjustRightPosition(this.getRightPosition(clientX, rect));
      this.subElements.thumbRight.style.right = this.subElements.progress.style.right = pos + '%';
      this.updateTo(pos);
    }
  }

  isTargetThumb(target) {
    return target === this.subElements?.thumbLeft ||
      target === this.subElements?.thumbRight;
  }

  onPointerDown = (event) => {
    if (!this.isTargetThumb(event.target)) return;

    this.thumb = event.target;

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove = (event) => {
    this.setElementsPositions(event.clientX);
  }

  dispatchRangeSelectEvent() {
    const rangeSelectEvent = new CustomEvent(
      'range-select',
      { detail: this.selected }
    );
    this.element?.dispatchEvent(rangeSelectEvent);
  }

  onPointerUp = (event) => {
    this.thumb = null;

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    this.dispatchRangeSelectEvent();
  }

  constructor({
    min = 0,
    max = 100,
    selected = {},
    formatValue = value => value,
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = {from: min, to: max, ...selected};
    this.formatValue = formatValue;
    this.render();
    this.addEventListeners();
  }

  get template() {
    return `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div data-element="ruler" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
    `
  }

  getSubElements(element, attribute) {
    const result = {};
    const elements = element.querySelectorAll(`[data-${attribute}]`);

    for (const subElement of elements) {
      const name = subElement.dataset[attribute];

      result[name] = subElement;
    }

    return result;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element, 'element');
  }

  addEventListeners() {
    document.addEventListener('pointerdown', this.onPointerDown);
  }

  removeEventListeners() {
    document.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
    this.subElements = null;
  }
}
