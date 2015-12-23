Inquirer list input
===================

> List prompt with arbitrary text input for [Inquirer](https://github.com/SBoudrias/Inquirer.js)

## Usage

You can register this prompt with a name of your choosing. Here is how you would register it as `'list-input'`:

```
inquirer.registerPrompt('list-input', require('inquirer-list-input'));
inquirer.prompt({
  type: 'list-input',
  ...
})
``