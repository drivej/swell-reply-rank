export interface IControlInput {
  onInput?(val: number): void;
}

export class ControlInput {
  $el = document.createElement('tr');
  label = 'label';
  value = 0;
  onInput: IControlInput['onInput'];

  constructor(config: { label: string; value: number; onInput:IControlInput['onInput'] }) {
    Object.assign(this, config);
    this.render();
  }

  render() {
    this.$el.innerHTML = `
        <td width="1"><label>${this.label}</label></td>
        <td><input type="range" min="${0}" max="${1}" step="0.01" value="${this.value}" /></td>
        <td><span>${this.value.toFixed(2)}</span></td>
    `;
    this.$el.querySelector<HTMLInputElement>('input').addEventListener('input', (e: InputEvent) => {
      this.value = parseFloat((e.currentTarget as HTMLInputElement).value);
      this.$el.querySelector('span').innerText = this.value.toFixed(2);
      this.onInput(this.value);
    });
  }
}
