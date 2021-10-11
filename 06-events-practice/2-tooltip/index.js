export default class Tooltip {
  static #instance = null;

  element;

  onMouseOver = (event) => {
    const tooltip = event.target.dataset.tooltip;
    if (tooltip !== undefined) {
      this.render(tooltip);
      document.addEventListener('mousemove', this.onMouseMove);
    }
  };

  onMouseOut = (event) => {
    if (event.target.dataset.tooltip !== undefined) {
      document.removeEventListener('mousemove', this.onMouseMove);
      this.remove();
    }
  };

  onMouseMove = (event) => {
    this.element.style.left = `${event.clientX + 10}px`;
    this.element.style.top = `${event.clientY + 10}px`;
  };

  constructor() {
    if (Tooltip.#instance) {
      return Tooltip.#instance;
    }

    Tooltip.#instance = this;
  }

  initialize() {
    this.addEventListeners();
  }

  render(text) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<div class="tooltip">${text}</div>`;
    this.element = wrapper.firstElementChild;
    document.body.append(this.element);
  }

  addEventListeners() {
    document.addEventListener('pointerover', this.onMouseOver);
    document.addEventListener('pointerout', this.onMouseOut);
  }

  removeEventListeners() {
    document.removeEventListener('pointerover', this.onMouseOver);
    document.removeEventListener('pointerout', this.onMouseOut);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    this.element = null;
    Tooltip.#instance = null;
  }
}
