/** @babel */

import path from 'path';
import {
  TextEditor,
  CompositeDisposable,
  Disposable,
} from 'atom';

export default class Dialog {
  constructor({ initialPath, iconClass, prompt } = {}) {
    this.disposables = new CompositeDisposable();

    this.element = document.createElement('div');
    this.element.classList.add('tree-view-dialog', 'ueno-dialog');

    const promptText = document.createElement('label');
    promptText.classList.add('icon');
    if (iconClass) {
      promptText.classList.add(iconClass);
    }
    promptText.textContent = prompt;
    this.element.appendChild(promptText);

    this.miniEditor = new TextEditor({ mini: true });

    const blurHandler = () => this.miniEditor.element.focus();
    const documentClickHandler = e => {
      // If the dialog is not found in the path of elements clicked
      // then close
      if (!e.path.find((el) => el === this.element)) {
        this.close();
      }
    }

    document.addEventListener('click', documentClickHandler)
    this.miniEditor.element.addEventListener('blur', blurHandler);
    // Make sure handlers will be removed
    this.disposables.add(new Disposable(() => this.miniEditor.element.removeEventListener('blur', blurHandler)));
    this.disposables.add(new Disposable(() => document.removeEventListener('click', documentClickHandler)));
    this.disposables.add(this.miniEditor.onDidChange(() => this.showError()));

    this.element.appendChild(this.miniEditor.element);

    this.errorMessage = document.createElement('div');
    this.errorMessage.classList.add('error-message');
    this.element.appendChild(this.errorMessage);

    // Add options
    this.element.appendChild(radioGroup('Select component type', 'type', ['class', 'functional']));
    this.element.appendChild(radioGroup('Select style syntax', 'styles', ['scss', 'less', 'css']));

    atom.commands.add(this.element, {
      'core:confirm': () => this.onConfirm({
        name: this.miniEditor.getText(),
        type: this.element.querySelector('input[name=type]:checked').value,
        styleType: this.element.querySelector('input[name=styles]:checked').value,
      }),
      'core:cancel': () => this.cancel(),
    });
  }

  attach() {
    this.panel = atom.workspace.addModalPanel({ item: this });
    this.miniEditor.element.focus();
    this.miniEditor.scrollToCursorPosition();
  }

  close() {
    panelToDestroy = this.panel;
    this.panel = null;
    if (panelToDestroy) {
      panelToDestroy.destroy();
    }
    this.disposables.dispose();
    this.miniEditor.destroy();
    atom.workspace.getActivePane().activate();
  }

  cancel() {
    this.close();
    const treeView = document.querySelector('.tree-view');
    if (treeView) {
      treeView.focus();
    }
  }

  showError(message='') {
    this.errorMessage.textContent = message;
    if (message) {
      this.element.classList.add('error');
      window.setTimeout(() => this.element.classList.remove('error'), 300);
    }
  }
}

function radioGroup (label, name, options) {
  const div = document.createElement('div');
  div.classList.add('radio', 'new-component');

  const descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('radio-label');
  descriptionDiv.innerHTML = label;
  div.appendChild(descriptionDiv);

  options.forEach((option, i) => {

    const labelEl = document.createElement('label');
    labelEl.for = name;

    const input = document.createElement('input');
    input.name = name;
    input.checked = i === 0;
    input.type = 'radio';
    input.value = option;
    input.innerHTML = option;
    input.classList.add('input-radio');
    labelEl.appendChild(input);

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('setting-title');
    titleDiv.textContent = option;
    labelEl.appendChild(titleDiv);
    div.appendChild(labelEl);
  });

  return div;
}
