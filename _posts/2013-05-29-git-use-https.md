---
layout: post
title: Tell git to use https instead of git protocol
tags: 
  - tools 
  - git
---

Many corporate firewalls blocks the [git protocol](http://git-scm.com/book/ch4-1.html#The-Git-Protocol), causing tools like [bower](http://bower.io/) to fail without jumping through some hoops. But pretty much every firewall allows web traffic through, so you can always use `https` if your tools know about it. The solution is to tell [git](http://git-scm.com/) to always use `https` instead of `git` by running the following command:

{% highlight bash %}
  git config --global url."https://".insteadOf git://
{% endhighlight %}

This adds the following to your `~/.gitconfig`:

    [url "https://"]
      insteadOf = git://

All git commands will perform a substitution of `git://` to `https://`. Thanks [StackOverflow](http://stackoverflow.com/questions/tagged/git)!

[Reference](http://stackoverflow.com/a/10729634)