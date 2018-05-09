import videojs from 'video.js';
import { version as VERSION } from '../package.json';

// Default options for the plugin.
const defaults = {
  title: "",
  description: "",
  url: "", // the url for the form to submit
  userIp: '', //optional, should get from twig. 
  feedbackOptions: [{
    optionID: '',
    optionType: 'checkbox', // can be radio too, if needed. 
    text: '',
    subtext: '',
    shouldHaveATextarea: false
  }]
};

// let's capture any error that player might throw
// the whole purpose of the plugin is to submit errors and feedbacks. 

const getPlayerErrors = (player) => {

  let error = {
    code: '',
    message: ''
  };


  if (!player.error()) {
    console.log('no error');
    error = 'No error reported on player';

  } else {
    error = JSON.stringify({
      code: player.error().code,
      message: player.error().message
    });
  }



  console.log(error);
  return error;
}

// helper function for creating elements 

function _createElement(type, className) {
  let el = document.createElement(type);
  el.className = className;
  return el;
}

// builds our httprequest

function sendData(form, url, userIp) {

  let XHR = new XMLHttpRequest();
  let feedbackFormData = new FormData(form);

  XHR.addEventListener('load', function(event) {
    console.log(event.target.responseText);
  });

  XHR.addEventListener('error', function(event) {
    console.log(event.target.responseText)
  })

  //let's push our data to formdata

  feedbackFormData.append('userAgent', navigator.userAgent);
  feedbackFormData.append('platform', navigator.platform);
  feedbackFormData.append('userIp', userIp);
  feedbackFormData.append('error[]', getPlayerErrors(player)); //can videoJS throw multiple errors? 



  XHR.open("POST", url);

  XHR.send(feedbackFormData);

  //return false; // I don't want to actually send data! I'll take it off as soon as everything is working.

}


const constructFeedbackOptions = (player, options) => {

  player.on('error', function() {
    getPlayerErrors(player);
  })

  // constructing the options div 

  let feedback = options.feedbackOptions; // see default object

  let _frag = document.createDocumentFragment();

  let container = _createElement('div', 'vjs-feedback'),
    header = _createElement('div', 'vjs-feedback-header'),
    title = _createElement('h3', 'vjs-feedback-form-title'),
    description = _createElement('p', 'vjs-feedback-form-description'),
    _form = _createElement('form', 'vjs-feedback-form form-control')

  title.innerHTML = options.title;
  description.innerHTML = options.description;

  header.appendChild(title);
  header.appendChild(description);

  // here are the checkboxes
  let j = feedback.length - 1;
  for (let i = 0; i <= j; i++) {

    let _div = _createElement('div', 'checkbox'),
      _label = _createElement('label', ''),
      _input = _createElement('input', '');
    _input.type = feedback[i].optionType;
    _input.value = feedback[i].text;
    _input.name = "feedback[]";

    let _text = _createElement('h5', '');
    _text.innerHTML = feedback[i].text;

    let _subtext = _createElement('h6', '');
    _subtext.innerHTML = feedback[i].subtext;

    _label.appendChild(_input);
    _label.appendChild(_text);
    _label.appendChild(_subtext);

    _div.appendChild(_label);

    if (feedback[i].shouldHaveATextarea == true) {
      console.log('show textarea')
    }

    _form.appendChild(_div);


  }

  let button = _createElement('button', 'form-submit');
  button.type = "button";
  button.innerHTML = "send feedback";

  _form.appendChild(button);

  container.appendChild(header);
  container.appendChild(_form);

  _frag.appendChild(container);

  player.el().appendChild(_frag);


  // let's take care of posting the data

  //I'm using formdata object, so no < IE11 and opera mini support. 
  // at least opera mini is consistent, it does not support ANY javascript!

  button.addEventListener('click', function(event) {
    //return;
    sendData(_form, options.url, options.userIp);
  })






}



// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-sendcustomerfeedback');
  player.on('ready', () => constructFeedbackOptions(player, options));
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function sendcustomerfeedback
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const sendcustomerfeedback = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
registerPlugin('sendcustomerfeedback', sendcustomerfeedback);

// Include the version number.
sendcustomerfeedback.VERSION = VERSION;

export default sendcustomerfeedback;
