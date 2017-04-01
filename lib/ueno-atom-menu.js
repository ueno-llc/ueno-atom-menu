/** @babel */

import { Emitter } from 'atom';
import AddDialog from './add-dialog';

const emitter = new Emitter();

export default {
  addComponent(path) {
    (new AddDialog(path)).attach();
  },
  activate(state) {
    atom.commands.add('atom-workspace', 'ueno-atom-menu:new-component', ({ target }) =>

      this.addComponent(target.dataset.path)
    )
  }
}
