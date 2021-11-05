export class ControlInput {
  $el = document.createElement('tr');
  label = 'label';
  value = 0;
  onInput = () => {};

  constructor(config) {
    Object.assign(this, config);
    this.render();
  }

  render(config) {
    this.$el.innerHTML = `
        <td width="1"><label>${this.label}</label></td>
        <td><input type="range" min="${0}" max="${1}" step="0.01" value="${this.value}" /></td>
        <td><span>${this.value.toFixed(2)}</span></td>
    `;
    this.$el.querySelector('input').addEventListener('input', (e) => {
      this.value = parseFloat(e.currentTarget.value);
      this.$el.querySelector('span').innerText = this.value.toFixed(2);
      this.onInput(this.value);
    });
  }
}
