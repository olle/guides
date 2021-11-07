# Guides.js

**WORK IN PROGRESS!**

_This is a fork of the original [Guides.js] library. It provides a classic
native HTML/CSS/JS distribution. No jQuery required. No module installation. No
build process. Just two files. You're welcome._

[guides.js]: https://github.com/ejulianova/guides

Guides.js is a lightweight JavaScript library for making guided website tours.
It finds the element you want to highlight, creates a guide element using the
HTML you specified in the configuration options and connects the guide and the
highlighted element with an SVG arrow.

# Getting started

Once you have downloaded the distribution, simply include `guides.min.css` in
the head of your page:

```html
<head>
  ...
  <link rel="stylesheet" href="guides.min.css" />
</head>
```

and `guides.min.js` in your page scripts section.

```html
	...
	<script src="guides.min.js"></script>
</body>
```

# Docs

## Initialization

Guides.js can be initialized on an element, that will "trigger" the guided tour:

```javascript
guides("#demo", {
  guides: [
    {
      element: ".navbar-brand",
      html: "Welcome to Guides.js",
    },
    {
      element: ".navbar",
      html: "Navigate through guides.js website",
    },
    {
      element: "#demo",
      html: "See how it works",
    },
    {
      element: "#download",
      html: "Download guides.js",
    },
    {
      element: "#getting-started",
      html: "Check out how to get started with guides.js",
    },
    {
      element: "#docs",
      html: "Read the docs",
    },
  ],
});
```

Now the tour will start everytime '#demo' element is clicked.

If you want to manually start the tour you can do the following:

```javascript
var guides = guides({
  guides: [
    {
      html: "Welcome to Guides.js",
    },
    {
      element: ".navbar",
      html: "Navigate through guides.js website",
    },
    {
      element: "#demo",
      html: "See how it works",
    },
    {
      element: "#download",
      html: "Download guides.js",
    },
    {
      element: "#getting-started",
      html: "Check out how to get started with guides.js",
    },
    {
      element: "#docs",
      html: "Read the docs",
    },
  ],
});
guides.start();
```

## Configuration options

The default options are as follows:

```javascript
{
	distance: 100,
	color: '#fffff',
	guides: []
}
```

- **distance** _number_ - distance between the guide text and the element that it is related to
- **color** _string_ - the guides arrows and text default color
- **guides** _array of objects_ - the list of guides

### The guides array

A guide object looks like this:

```javascript
{
	element: '.navbar-brand',
	html: 'Welcome to Guides.js',
	color: '#fff'
}
```

- **element** (optional) _string_ - the selector you want to highlight; if omitted the guide will be centered;
- **html** (required) _string_ - this is the content of the tip: you can enter plain text or markup
- **color** (optional) _string_ - the guide arrow and text color (falls back to the default color if not specified)
- **render** (optional) _function_ - a callback function that is called before guide is rendered

## Events

- **start** guides('#demo', { start: onStartFunction });
- **end** guides('#demo', { end: onStartFunction });
- **next** guides('#demo', { next: onNextFunction });
- **prev** guides('#demo', { prev: onPrevFunction });
- **render** guides('#demo', { render: onRenderFunction });
- **destroy** guides('#demo', { destroy: onDestroyFunction });
