export default class NotificationMessage {
  static displayedInstance = null;

  element;

  constructor(message = '', {duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  show(container = document.body) {
    if (NotificationMessage.displayedInstance) {
      NotificationMessage.displayedInstance.remove();
    }

    container.append(this.element);
    NotificationMessage.displayedInstance = this;
    this.timer = setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element?.remove();

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    NotificationMessage.displayedInstance = null;
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
