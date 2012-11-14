---
layout: post
title: Git backed wiki - Gollum
tags: 
  - git
  - github
  - tools
---

## Markdown

I just noticed, via [onethingwell](http://onethingwell.org/post/35638422041/commonplace), a new tool called [Commonplace](http://helloform.com/projects/commonplace/) that acts as a server for your markdown files, basically providing pretty markdown rendering and basic editing functionality. Kind of like a wiki. I use [marked](http://markedapp.com/) for viewing [markdown](http://daringfireball.net/projects/markdown/) files. marked a great mac app developed by [Brett Terpestra](http://brettterpstra.com/), creator of [nvAlt](http://brettterpstra.com/project/nvalt/), a Notational Velocity fork. From [TextMate 2](https://github.com/textmate/textmate), or from other common text editors, you can install a bundle to integrate easily with marked, and you can add your own custom styles for viewing the markdown. I [created a style](https://github.com/jgoodall/markedapp-solarized) inspired by the great [solarized](http://ethanschoonover.com/solarized) color palette.

## Wikis

Anyway, Commonplace got me thinking of serving markdown files, and more generally in wikis. I have hated almost every wiki that I have ever tried: [MediaWiki](https://www.mediawiki.org/wiki/MediaWiki), [DokuWiki](https://www.dokuwiki.org/dokuwiki), and the rest that I have played with. (Ward Cunningham has a list of [popular wiki engines](http://c2.com/cgi/wiki?TopTenWikiEngines) that is a good starting point for finding wikis). 

## Golum

This brings me to [gollum](https://github.com/github/gollum), a wiki built on top of [Git](http://git-scm.com/) from [github](https://github.com/). It is the same engine that powers github project wiki pages. It supports lots of different formats for source files, including markdown, mediawiki, org mode, and textile. It is easily customizable with simple files for a sidebar, header and footer. Syntax highlighting is included via [Pygments](http://pygments.org/);  mathematical equations via [Mathjax](http://docs.mathjax.org/en/latest/index.html). Installation is surprisingly easy, via [RubyGems](https://rubygems.org/):

    gem install gollum
    
There is a built in web editor, but we prefer to use git for all our edits. This provides a history of who is editing the files, and at one point we had a git corruption issue when editing from the web server itself (although I suspect this has been fixed). Since our team uses git regularly for all our source code, everyone is already familiar with the workflow, and I much prefer to edit markdown files in TextMate, while other members of our team use [org mode](http://orgmode.org/) with Emacs. Having a wiki where all editing is done locally, rather than through a web interface, while using any format you want is actually pretty awesome. We have taken care to keep things organized in a structured hierarchy, so navigating the wiki from the terminal is easy, and there is a built-in search in the web interface. Although not perfect, it is the best wiki I have used. Thanks github, for making me not hate wikis any more.