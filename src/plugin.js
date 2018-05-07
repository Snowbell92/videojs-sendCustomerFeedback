import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {
	title : "",
	description : "",
	feedbackOptions: [{
		optionID : '',
		optionType: 'checkbox', // can be radio too, if needed. 
		text: '',
		subtext : '',
		shouldHaveATextarea : false
	}]
};

// helper function for creating elements 

function _createElement (type, className){
	let el = document.createElement(type);
	el.className = className; 
	return el; 
}

// constructing the options div 

const constructFeedbackOptions = (player, options) => {

	let feedback = options.feedbackOptions; // see default object

	let _frag = document.createDocumentFragment();

	let container = _createElement('div', 'vjs-feedback'),
	    header    = _createElement('div', 'vjs-feedback-header'),
	    title     = _createElement('h3', 'vjs-feedback-form-title'),
	    description = _createElement('p', 'vjs-feedback-form-description'),
		_form     = _createElement('form', 'vjs-feedback-form form-control')

		title.innerHTML = options.title;
		description.innerHTML = options.description;

		header.appendChild(title);
		header.appendChild(description);

		// here are the checkboxes
		let j = feedback.length - 1;
		for (let i = 0 ; i <= j ; i++){

			let _div = _createElement('div', 'checkbox'),
			_label = _createElement('label',''),
			_input = _createElement('input', '');
			_input.type = feedback[i].optionType;
			_input.value = feedback[i].optionID;

			let _text = _createElement('h5','');
			_text.innerHTML = feedback[i].text;

			let _subtext = _createElement('h6','');
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

		container.appendChild(header);
		container.appendChild(_form);

		_frag.appendChild(container);

		player.el().appendChild(_frag);


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
  player.on('ready', () => constructFeedbackOptions(player,options)); 
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
