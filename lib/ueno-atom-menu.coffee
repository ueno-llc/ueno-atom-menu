{Emitter} = require 'atom'
AddDialog = require './add-dialog'

@emitter = new Emitter

module.exports =
  addComponent: (path) ->
    dialog = new AddDialog(path)
    dialog.onDidCreateDirectory (createdPath) =>
    dialog.attach()

  activate: (state) ->
    atom.commands.add 'atom-workspace', 'ueno-atom-menu:new-component', ({target}) =>
      @addComponent(target.dataset.path)
