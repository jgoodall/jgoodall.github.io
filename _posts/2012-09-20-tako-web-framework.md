---
layout: post
title: Tako web framework
tags: 
  - nodejs
---

## Node.js web frameworks

There are a bunch of [node.js](http://nodejs.org/) web frameworks. They provide support for routing, templating, and  [Express](http://expressjs.com/) is probably the most common and mature. It uses [Connect](http://www.senchalabs.org/connect/) for its middleware component. It is pretty awesome, with lots of middleware available (try `npm search connect-` and `npm search express-`). It has been around for a while, is probably the most heavily used, and is under current development. It is flexible in terms of the [template engines](http://expressjs.com/guide.html#template-engines) that you use, but using [jade](), which makes writing html not suck nearly as much as usual, is installed by default. (There is also another library, [consolidate](https://github.com/visionmedia/consolidate.js), from the same [ridiculously prolific developer](http://tjholowaychuk.com/) of express and jade for hooking into a whole bunch of other template engines in express.) There are other frameworks out there too:

  * [Geddy](http://geddyjs.org/) is a monolithic solution from the folks at [yammer](http://yammer.com/).
  * [Flatiron](http://flatironjs.org/), from the awesome folks at [nodejitsu](http://nodejitsu.com/), is a bunch of small libraries that can be composed to make web or CLI apps. Pretty cool that you can use the same components to build both web and CLI apps. I've used their logger, [winston](http://flatironjs.org/#logging), before and it just works.
  * [Restify](http://mcavage.github.com/node-restify/) is a libray with a similar feel to express for building RESTful APIs.
  * [ApiServer](http://kilianc.github.com/node-apiserver/) is a	another library for building an API server.

A recent [nodeup](http://nodeup.com/fourteen) podcast covered some of these. Frankly, I dont have time to try them all, and dont have any real complaints with express. All the same, I decided to give [tako](https://github.com/mikeal/tako) a few hours and see what it was all about.


## Tako

[Mikeal Rogers](http://www.mikealrogers.com/), [@mikeal](https://twitter.com/#!/mikeal), and [Max Ogden](http://www.maxogden.com/), [@maxogden](https://twitter.com/#!/maxogden), recently released a [bunch of open source libraries for node](http://www.mikealrogers.com/posts/open-source.html). One of these projects is a web framework, called [tako](https://github.com/mikeal/tako). It is really small, a single 24k file (compared to express, which looks like it is ~96k based on the files in lib). It is simple by design. From the author:

> tako includes all the features we needed from a web framework to build our app. It’s not a middleware or plugin system and doesn’t include one. It’s a tool for handling HTTP requests in a sensible way.

> It has a composable API around routes. A route is an object and based on what kinds of handlers you add and conditions you might set tako can respond properly to various HTTP methods and content-type requests in an appropriate manner.

> It can also serve files sensibly using filed which already streams and returns/responds to proper etag and if-modified headers.

> It already includes socket.io. It includes JSON support. It can serve buffers from cache.

The first thing you notice is that there is not a lot of documentation, basically just a minimal readme. The next thing is that it is pretty straightforward to get started. Here is a simple example for a single page app:

{% highlight javascript linenos %}

    var fs = require('fs')
      , path = require('path')
      , tako = require('tako')
      , gzip = require('tako-gzip')

    // global variables
    var app = tako()
      , indexHtml = fs.readFileSync(path.join(__dirname, './html/index.html')).toString()
      , notfoundHtml = fs.readFileSync(path.join(__dirname, './html/notfound.html')).toString()

    // static files
    app.route('/public/*').files(path.join(__dirname, './public'))

    // routes
    app.route('/')
      .html(renderIndex)
      .methods('GET')

    // page not found
    app.notfound(notfoundHtml)

    // listen
    app.httpServer.listen(8000)

    // just render the html
    function renderIndex(req, res) {
      res.end(indexHtml)
    }

{% endhighlight %}

All it does is serve an index file and the static assets. I am using [grunt](https://github.com/cowboy/grunt/) to compile [jade templates](https://github.com/gruntjs/grunt-contrib/blob/master/docs/jade.md) into html, [combine](https://github.com/cowboy/grunt/blob/master/docs/task_concat.md) and [uglify](https://github.com/cowboy/grunt/blob/master/docs/task_min.md) javascript files, and combine and [minify css](https://github.com/gruntjs/grunt-contrib/blob/master/docs/mincss.md) files. So the web server is only serving static files. There is also an html file for 404 errors.


## Socket.io

Tako includes [socket.io](http://socket.io/). To use it:

{% highlight javascript linenos %}

    app.sockets.on('connection', function (socket) {
      socket.on('connect', function () {
        app.sockets.emit('user connected') // broadcast
      })
      socket.on('disconnect', function () {
        app.sockets.emit('user disconnected') // broadcast
      })
    })

{% endhighlight %}

One thing that took me a few minutes to figure out is how to get to the socket.io settings. I think there are two ways:

1. when you instantiate tako: `app = tako({'socketio':{'log level':2}})`
2. using socket.io [Manager](https://github.com/LearnBoost/socket.io/blob/master/lib/manager.js): `app.socketioManager.set('log level', 2)`

Obviously, you can do more than change the log level, see [more configuration options](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO).


## Plugins?

Tako does not support plugins. But there seems to be some plugins.

    $ npm search tako-
    NAME                DESCRIPTION                   AUTHOR   DATE              KEY
    tako-cookies        A cookie middleware for tako  =isaacs  2012-04-20 19:23
    tako-gzip           gzip for tako                 =kesla   2012-04-29 22:17
    tako-session-token  session tokens for tako       =isaacs  2012-04-20 19:47
    
Author [isaacs](http://blog.izs.me/) wrote [npm](http://npmjs.org/) and modules like [supervisor](https://github.com/isaacs/node-supervisor) and inherited 'dictatorship' of node itself from Ryah Dhal, node's creator. I dont know why he is he using tako, but that is a good sign right?

So back to plugins, the gzip one is pretty straightforward:

{% highlight javascript linenos %}

    var gzip = require('tako-gzip')
    app.on('request', gzip)

{% endhighlight %}
    
Not sure why you **wouldn't** want to do that...

If you listen to the [Nodeup podcast]((http://nodeup.com/) or read the [author's writings]((http://www.mikealrogers.com/),), you know he is a crazy smart, thoughtful, and opinionated developer. I want to use this framework, but I am not a good enough node.js developer to be able to figure out everything it is doing. So I think it is a nice framework, but needs a lot of help getting the same level of documentation as other, more mature projects like express. If I need to put together something quick and relatively straightforward, then I love this, but for larger projects, I am sticking with Express until the documentation for this one gets a bit better. My hunch is that I am not the target audience and this is made for people that are going to dig into the source code and figure out exactly how it is working, but then again, if you are going to do that, then do you really need a web framework?