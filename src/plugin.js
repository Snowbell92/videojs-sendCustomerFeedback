import videojs from 'video.js';
import platform from 'platform';
import { version as VERSION } from '../package.json';

// Default options for the plugin.
const defaults = {
  title: '',
  description: '',
  url: '',
  userIp: '',
  feedbackOptions: [{
    optionType: 'checkbox',
    text: '',
    subtext: '',
    shouldHaveATextarea: false
  }]
};

// capturing deviceInfo. Using platform.js
// github : https://github.com/bestiejs/platform.js

const getDeviceInfo = () => {
  const deviceInfo = {
    browser: platform.name,
    device: platform.product || 'No product information was found',
    deviceUserAgent: platform.ua,
    browserVersion: platform.version,
    renderEngine: platform.layout,
    os: platform.os.family,
    osVersion: platform.os.version,
    deviceManufacturer: platform.manufacturer || 'No manufacturer information was found',
    deviceDescription: platform.description
  };

  return JSON.stringify(deviceInfo);

};

// let's capture any error that player might throw
// the whole purpose of the plugin is to submit errors and feedbacks.

const getPlayerErrors = (player) => {

  let error = {
    code: '',
    message: ''
  };

  if (!player.error()) {
    error = 'No error reported on player';

  } else {
    error = JSON.stringify({
      code: player.error().code,
      message: player.error().message
    });
  }

  return error;
};

// helper function for creating elements

function _createElement(type, className) {
  const el = document.createElement(type);

  if (className) {
    el.className = className;
  }
  return el;
}

// builds our httprequest

function sendData(form, url, userIp, modal) {

  const _element = document.getElementsByClassName('vjs-feedback-container');
  const loader = _element[0].getElementsByClassName('loader')[0];

  let XHR = new XMLHttpRequest();
  let feedbackFormData = new FormData(form);

  XHR.addEventListener('load', function(event) {

    // removes loader
    // _element[0].removeChild(loader);
    loader.className += ' hide';

    // shows success message
    let successMessage = _createElement('div', 'success');
    successMessage.innerHTML = '<p>' + 'Your feedback was sent successfully.Thank you for taking your time to let us know.' + '</p>'
    _element[0].appendChild(successMessage);

    // activate the button again
    form.getElementsByTagName('button')[0].disabled = false;

    // reset the form. 
    form.reset();

    // closes the modal and hides the success div.
    window.setTimeout(function() {
      modal.close();
      // remove success message too, if it exists.
      if (successMessage) {
        _element[0].removeChild(successMessage);
      }
    }, 5000)


    console.log(event.target.responseText);
  });

  XHR.addEventListener('error', function(event) {
    // removes loader
    _element[0].removeChild(loader);

    // shows error message
    let failureMessage = _createElement('div', 'failed');
    failureMessage.innerHTML = '<p>' + 'Sorry! There was a problem and your feedback could not be submitted. Perhaps try again later?' + '</p>' + '<p>' + 'Error:' + event.target.responseText + '</p>'
    _element[0].appendChild(failureMessage);

    // activate the button again
    form.getElementsByTagName('button')[0].disabled = false;

    // reset the form. 
    form.reset();
    console.log(event.target.responseText)
  })

  // let's push some extra information to formdata

  feedbackFormData.append('userAgent', navigator.userAgent);
  feedbackFormData.append('platform', navigator.platform);
  feedbackFormData.append('userIp', userIp);
  feedbackFormData.append('error[]', getPlayerErrors(player)); //can videoJS throw multiple errors? 
  feedbackFormData.append('deviceInfo', getDeviceInfo());



  XHR.open("POST", url);

  XHR.send(feedbackFormData);

}


const constructFeedbackOptions = (player, options) => {

  player.on('error', function() {
    getPlayerErrors(player);
  })

  // constructing the options div

  let feedback = options.feedbackOptions; //see default object

  let _frag = document.createDocumentFragment();

  let container = _createElement('div', 'vjs-feedback'),
    header = _createElement('div', 'vjs-feedback-header'),
    title = _createElement('h3', 'vjs-feedback-form-title'),
    description = _createElement('p', 'vjs-feedback-form-description'),
    _form = _createElement('form', 'vjs-feedback-form')

  title.innerHTML = options.title;
  description.innerHTML = options.description;

  header.appendChild(title);
  header.appendChild(description);

  // here are the checkboxes
  let j = feedback.length - 1;
  for (let i = 0; i <= j; i++) {

    let _div = _createElement('div', 'checkbox'),
      _label = _createElement('label'),
      _input = _createElement('input');
    _input.type = feedback[i].optionType;
    _input.value = feedback[i].text;
    _input.name = "feedback[]";

    let _text = _createElement('h5');
    _text.innerHTML = feedback[i].text;

    let _subtext = _createElement('h6');
    _subtext.innerHTML = feedback[i].subtext;

    _label.appendChild(_input);
    _label.appendChild(_text);
    _label.appendChild(_subtext);

    _div.appendChild(_label);

    if (feedback[i].shouldHaveATextarea === true) {
      console.log('show textarea')
    }

    _form.appendChild(_div);


  }

  let button = _createElement('button', 'form-submit');
  button.type = "button";
  button.innerHTML = "send feedback";

  let message = _createElement('div', 'error-message');

  _form.appendChild(button);
  _form.insertBefore(message, button);


  container.appendChild(header);
  container.appendChild(_form);

  _frag.appendChild(container);

  // let's make a modal window and append our UI to it.

  const contentEl = _createElement('div', 'vjs-feedback-container');

  contentEl.appendChild(_frag);

  const ModalDialog = videojs.getComponent('ModalDialog');
  const modal = new ModalDialog(player, {
    content: contentEl,
    // We don't want this modal to go away when it closes.
    temporary: false,
  });

  player.addChild(modal);

  // let's make the floating button that will open the modal window. 

  const floatingButton = _createElement('button', 'open-feedback-form');

  floatingButton.type = 'button';
  floatingButton.title = 'Problem? Send us some details!';
  floatingButton.innerHTML = 'open feedback';

  player.el().appendChild(floatingButton);

  floatingButton.addEventListener('click', function() {
    console.log('clicked');
    modal.open();
  })

  // let's take care of posting the data

  // I'm using formdata object, so no < IE11 and opera mini support.
  // at least opera mini is consistent, it does not support ANY javascript!

  // but have to check first if the form is empty.
  // no point submitting an empty form.
  let flag = false;

  function checkEmptyForm(elements) {

    for (let i = 0; i < _form.elements.length; i++) {

      if (_form.elements[i].checked) {
        flag = true;
        return flag;
        break;
      }
    }
    message.classList.remove('active');
    return flag;
  }

  button.addEventListener('click', function(event) {

    if (!checkEmptyForm()) {
      message.innerHTML = '<p>' + 'Form is empty. Please select an option and try again.' + '</p>';
      message.className += ' active';

    } else {
      button.disabled = true;
      
      // show a loading animation first

      const loader = _createElement('div', 'loader');

      loader.innerHTML = 'Loading'; 
      contentEl.insertBefore(loader, container);

      // simulate server delay for 10 seconds and send the form
      setTimeout(function() {
        sendData(_form, options.url, options.userIp, modal);
      }, 10000);

    }
  });
};

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
