# videojs-sendcustomerfeedback

a customer feedback form that will collect information from a list of checkboxes and will send it to a preferred url. 

still work in progress. 

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Installation

- [Installation](#installation)
- [Usage](#usage)
  - [`<script>` Tag](#script-tag)
  - [Browserify/CommonJS](#browserifycommonjs)
  - [RequireJS/AMD](#requirejsamd)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
## Installation
<!--
```sh
npm install --save videojs-sendcustomerfeedback
```-->

## Usage

To include videojs-sendcustomerfeedback on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-sendcustomerfeedback.min.js"></script>
<script>
  var player = videojs('my-video');

  player.sendcustomerfeedback();
</script>
```
## License

MIT. Copyright (c) Samia Ruponti &lt;samia@bongobd.com&gt;


[videojs]: http://videojs.com/
