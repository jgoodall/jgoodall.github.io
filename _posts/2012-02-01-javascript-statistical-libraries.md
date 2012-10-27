---
layout: post
title: Javascript statistics libraries
tags: 
  - javascript
  - statistics
---

There are a bunch of javascript statistics libraries for [node.js](http://nodejs.org/) and the browser around, but they arent always easy to find. Here are a couple that I have come across.

## Gauss
[Gauss](https://github.com/stackd/gauss), from [Stackd](https://github.com/stackd), is a JavaScript statistics library that is ready to use with node.js featuring callbacks and method chaining. It seems to be actively updated. Gauss has methods for univariate and time series analysis (although the time series seems pretty limited so far).

> Evented, asynchronous, and fast, Node.JS is an attractive platform for data mining, statistics, and data analysis. Gauss makes it easy to calculate and explore data through JavaScript.

[Github Download](https://github.com/stackd/gauss)

[npm](http://search.npmjs.org/#/gauss) install

    npm install gauss

## Sylvester
[Sylvester](http://sylvester.jcoglan.com/) is a Javascript library by [James Coglan](http://blog.jcoglan.com/) for math on vectors and matrices. Hard to tell if it is updated, since the source doesn't seem to be on github or some other public repository. Chris Umbel has created [a node.js port](http://search.npmjs.org/#/sylvester).

> Sylvester is a JavaScript library designed to let you do mathematics with vectors and matrices without having to write lots of loops and throw piles of arrays around. It includes classes for modelling vectors and matrices in any number of dimensions, and for modelling infinite lines and planes in 3-dimensional space. It lets you write object-oriented easy-to-read code that mirrors the maths it represents. 

> Later releases will add components for more specific geometric modelling functionality, building towards a feature-complete 1.0 release.

[Download](http://sylvester.jcoglan.com/#download)

[npm](http://search.npmjs.org/#/sylvester) install

    npm install sylvester

## JStat
[JStat](http://www.jstat.org/) is a Javascript statistical library intended for use in the browser. It optionally includes [jQuery](http://jquery.com/), [jQuery UI](http://jqueryui.com/) and [flot](https://code.google.com/p/flot/) for building plots. It seems to be actively updated, but has no real documentation yet. 

There is a github repo, but it is hard to tell if it is up to date, given this note on the github page: *The code in this repository does not currently match that found on www.jstat.org. We are in the process of merging two similar projects and will update the website once the merge is complete.*

> jStat is a statistical library written in JavaScript that allows you to perform advanced statistical operations without the need of a dedicated statistical language (i.e. MATLAB or R).

[Download](http://www.jstat.org/download)

[Github Download](https://github.com/jstat/jstat)


## Science.js
[Science.js](https://github.com/jasondavies/science.js) is a new statistics library from [Jason Davies](http://www.jasondavies.com/) originally intended for use with [d3.js](http://mbostock.github.com/d3/), the excellent visualization library for javascript. It has methods for statistics and linear algebra. It is a new project, [coming soon](http://www.sciencejs.org/) on the home page, that seems pretty actively updated. No npm/node.js integration (yet?).

> Science.js is a JavaScript library for scientific and statistical computing. 

> Currently, there are two modules:

>   * science.stats, containing various implementations of statistical methods similar to those provided by R;

>   * science.lin, for linear algebra.

[Github download](https://github.com/jasondavies/science.js)