_ = require 'lodash'
path = require 'path'
fs = require 'fs-plus'
Dialog = require './dialog'

module.exports =
class AddDialog extends Dialog
  constructor: (initialPath) ->
    if fs.isFileSync(initialPath)
      @directoryPath = path.dirname(initialPath)
    else
      @directoryPath = initialPath

    super
      prompt: "Enter the name for the new component"
      initialPath: @directoryPath
      select: false
      iconClass: 'icon-file-directory-create'

  onDidCreateDirectory: (callback) ->
    @emitter.on('did-create-directory', callback)

  onConfirm: (componentName) =>
    componentName = componentName.replace(/\s+$/, '') # Remove trailing whitespace
    componentNameCamel = _.camelCase(componentName)
    componentNameCap = _.capitalize(componentName)
    componentNameKebab = _.kebabCase(componentName)
    componentPath = path.join(@directoryPath, componentNameKebab)
    componentFilePath = path.join(componentPath, "#{componentName}.js")
    componentStylePath = path.join(componentPath, "#{componentName}.scss")
    componentIndexPath = path.join(componentPath, 'index.js')

    [componentFileContents, componentStyleContents, componentIndexContents] =
    [ 'component-template/Component.txt',
      'component-template/ComponentStyle.txt',
      'component-template/index.txt' ]
      .map((f) =>
        fs.readFileSync(path.join(__dirname, f), 'utf8')
        .replace(/##COMPONENT_NAME##/g, componentName)
        .replace(/##COMPONENT_NAME_CAMEL##/g, _.camelCase(componentNameCamel))
    )
    return unless componentPath

    try
      if fs.existsSync(componentPath)
        @showError("'#{componentPath}' already exists.")
      else
        fs.makeTreeSync(componentPath)
        fs.writeFileSync(componentFilePath, componentFileContents)
        fs.writeFileSync(componentStylePath, componentStyleContents)
        fs.writeFileSync(componentIndexPath, componentIndexContents)
        @emitter.emit('did-create-directory', componentPath)
        @cancel()
    catch error
      @showError("#{error.message}.")
