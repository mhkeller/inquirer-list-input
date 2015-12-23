/**
 * `list-input` type prompt
 */

var util = require('util')
var chalk = require('chalk')
var figures = require('figures')
var cliCursor = require("cli-cursor");
var Base = require('inquirer/lib/prompts/base')
var Choices = require('inquirer/lib/objects/choices')
var observe = require('inquirer/lib/utils/events')
var utils = require('inquirer/lib/utils/readline')
var Paginator = require('inquirer/lib/utils/paginator')
var readline = require('readline')
var _ = require('lodash')
/**
 * Module exports
 */

module.exports = Prompt;


/**
 * Constructor
 */

function Prompt() {
  Base.apply( this, arguments );

  if (!this.opt.choices) {
    this.throwParamError("choices");
  }

  this.firstRender = true;
  this.selected = 0;
  this.mode = 'list';
  this.initialState = true;
  this.helpText = "(Use arrows or type)";

  var def = this.opt.default;

  // Default being a Number
  if ( _.isNumber(def) && def >= 0 && def < this.opt.choices.realLength ) {
    this.selected = def;
  }

  // Default being a String
  if ( _.isString(def) ) {
    this.selected = this.opt.choices.pluck("value").indexOf( def );
  }

  // Make sure no default is set (so it won't be printed)
  this.opt.default = null;

  this.paginator = new Paginator();
}
util.inherits( Prompt, Base );


/**
 * Start the Inquiry session
 * @param  {Function} cb      Callback when prompt is done
 * @return {this}
 */

Prompt.prototype._run = function( cb ) {
  this.done = cb;

  var events = observe(this.rl);
  events.normalizedUpKey.takeUntil( events.line ).forEach( this.onUpKey.bind(this) );
  events.normalizedDownKey.takeUntil( events.line ).forEach( this.onDownKey.bind(this) );
  var submit = events.line.map( this.filterInput.bind(this) );
  var validation = this.handleSubmitEvents( submit );
  events.keypress.takeUntil( validation.success ).forEach( this.onKeypress.bind(this) );
  validation.success.forEach( this.onEnd.bind(this) );
  validation.error.forEach( this.onError.bind(this) );

  // Init the prompt
  // cliCursor.hide();
  this.render();

  return this;
};


/**
 * Render the prompt to screen
 * @return {Prompt} self
 */

Prompt.prototype.render = function(error ) {
  var cursor = 0 

  // Render question
  var message = this.getQuestion();

  if ( this.firstRender ) {
    message += chalk.dim( this.helpText );
  }

  // Render choices or answer depending on the state
  if ( this.status === "answered" ) {
    if (this.mode == 'list') {
      message += chalk.cyan( this.opt.choices.getChoice(this.selected).short );
    } else if (this.mode == 'input') {
      message += chalk.cyan( this.rl.line || this.answer );
    }
    // figure out if this is from line or input to display properly
  } else {
    var choicesStr = listRender(this.opt.choices, this.selected, this.mode);
    var manual_entry = (this.firstRender) ? '' : this.rl.line
    message += manual_entry + "\n" + this.paginator.paginate(choicesStr, this.selected, this.opt.pageSize);
  }

  if (error) {
    message += '\n' + chalk.red('>> ') + error;
    cursor++;
  }
  // Move cursor to the first line
  cursor = cursor + message.split('\n').length - 1;

  this.firstRender = false;

  this.screen.render(message, {cursor: cursor});
};


/**
 * When user press `enter` key
 */

Prompt.prototype.filterInput = function( input ) {
  if ( !input ) {
    return this.opt.default != null ? this.opt.default : "";
  }
  return input;
};

Prompt.prototype.onEnd = function( state ) {
  if (this.initialState) {
    state.value = this.opt.choices.getChoice( 0 ).value;
  }
  this.filter( state.value, function( filteredValue ) {
    this.answer = filteredValue;
    this.status = "answered";

    // Re-render prompt
    this.render();

    this.screen.done();

    this.done( state.value );
    this.initialState = true;
    cliCursor.show();
  }.bind(this));
};

Prompt.prototype.onError = function( state ) {
  this.render(state.isValid);
};

/**
 * When user press a key
 */
Prompt.prototype.onUpKey = function(e) {
  if (this.opt.editableList) {
    cliCursor.show();
  } else {
    cliCursor.hide();
  }
  if (e.key.name === 'j' || e.key.name === 'k'){
    return false;
  }
  this.mode = 'list';
  this.initialState = false;
  var len = this.opt.choices.realLength;
  this.selected = (this.selected > 0) ? this.selected - 1 : len - 1;
  var choice = this.opt.choices.getChoice( this.selected );
  this.rl.line = choice.name;
  this.render();
};

Prompt.prototype.onDownKey = function(e) {
  if (this.opt.editableList) {
    cliCursor.show();
  } else {
    cliCursor.hide();
  }
  if (e.key.name === 'j' || e.key.name === 'k'){
    return false;
  }
  this.mode = 'list';
  this.initialState = false;
  var len = this.opt.choices.realLength;
  this.selected = (this.selected < len - 1) ? this.selected + 1 : 0;
  var choice = this.opt.choices.getChoice( this.selected );
  this.rl.line = choice.name;
  this.render();
};

/**
 * When user press a key
 */

Prompt.prototype.onKeypress = function(e) {
  var keyName = (e.key && e.key.name)
  if (keyName !== 'down' && keyName !== 'up') {
    cliCursor.show();
    if (this.mode == 'list') {
      this.mode = 'input';
      var ctrl = e.ctrl || e.key.ctrl
      if ((keyName !== 'left' && keyName !== 'right' && keyName !== 'backspace' && keyName !== 'tab' && ctrl === false)) {
        this.rl.line = e.key.name
      } else if (keyName === 'tab') {
        return false
      }
    } 
    this.render(); //render input automatically
    if (this.initialState){
      this.rl.output.unmute()
      utils.left(this.rl, this.helpText.length )
      this.rl.output.mute()
      this.initialState = false;
    }
  } else {
    return false;
  }
};


/**
 * Function for rendering list choices
 * @param  {Number} pointer Position of the pointer
 * @return {String}         Rendered content
 */
 function listRender(choices, pointer, mode) {
  var output = '';
  var separatorOffset = 0;

  choices.forEach(function (choice, i) {
    if (choice.type === 'separator') {
      separatorOffset++;
      output += '  ' + choice + '\n';
      return;
    }

    var isSelected = (i - separatorOffset === pointer);
    var line = (isSelected ? figures.pointer + ' ' : '  ') + choice.name;
    if (isSelected) {
      var color = (mode === 'list') ? 'cyan' : 'gray'
      line = chalk[color](line);
    }
    output += line + ' \n';
  });

  return output.replace(/\n$/, '');
}