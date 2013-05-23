---
layout: post
title: Vagrant, Chef, and Berkshelf
tags: 
  - development 
  - vagrant
---

[Vagrant](http://www.vagrantup.com/) is a tool to create portable, sharable development and testing environments. It is used to build, provision, and configure a virtual machine (by default, [VirtualBox](https://www.virtualbox.org/)). Here we will configure Vagrant with [nodejs](http://nodejs.org/) and [redis](http://redis.io/). [Chef](http://www.opscode.com/chef/) and [berkshelf](http://berkshelf.com/) are used for provisioning.

The complete setup is available at [https://github.com/jgoodall/vagrant-node](https://github.com/jgoodall/vagrant-node).

## Install and configure Vagrant

First, [download VirtualBox](https://www.virtualbox.org/wiki/Downloads) and install.

[Download a Vagrant installer](http://downloads.vagrantup.com/) for Mac OS, Windows, and Linux and install it.

To create an initial Vagrant file, run the command:

		vagrant init

The `init` command creates a sample `Vagrantfile`, which is the main configuration. 

The first thing we need to do is add a *box*. Vagrant has a couple of preconfigured Ubuntu boxes (referred to in the [Vagrant Docs](http://docs.vagrantup.com/v2/boxes.html)), but there is a [large list of available boxes](http://www.vagrantbox.es/). We are just going to use one of the available Ubuntu boxes, `precise64` ([Ubuntu 12.04](http://releases.ubuntu.com/precise/)). Edit the `Vagrantfile`, near the top:

    # Every Vagrant virtual environment requires a box to build off of.
    config.vm.box = "precise64"

    # The url from where the 'config.vm.box' box will be fetched if it
    # doesn't already exist on the user's system.
    config.vm.box_url = "http://files.vagrantup.com/precise64.box"

To access the guest VM from the host OS, set up *port forwarding*. To set forwarding to access port 8000 on the guest VM from http://localhost:8000 on the host OS:

    config.vm.network :forwarded_port, guest: 8000, host: 8000

For the [VirtualBox](https://www.virtualbox.org/) *provider*, we can [customize the provider settings](http://docs.vagrantup.com/v2/providers/configuration.html) by modifying this section, for example to set the VM memory to 2GB:

    config.vm.provider :virtualbox do |vb|
      vb.customize ["modifyvm", :id, "--memory", "2048"]
    end

Here is a [full list of the settings for VirtualBox](http://www.virtualbox.org/manual/ch08.html#vboxmanage-modifyvm).


## Configure provisioning

We will use [Chef](http://www.opscode.com/chef/) for provisioning, but [Puppet](https://puppetlabs.com/) works too. Ops people undoubtedly have a preference, but for our purposes either works. One of the main differences is that Chef configuration is written in [Ruby](http://www.ruby-lang.org/), while Puppet uses its own [domain specific language](http://docs.puppetlabs.com/puppet/3/reference/lang_summary.html).

### Cookbooks

* [Chef cookbooks](http://community.opscode.com/cookbooks)
* [Puppet forge](http://forge.puppetlabs.com/)

### Docs

* [Chef docs](http://docs.opscode.com/)
* [Puppet docs](http://docs.puppetlabs.com/puppet/)

### Chef Solo

While either Puppet or Chef will work, but we are going to use Chef Solo with our Vagrant setup. The [Vagrant documentation on Chef Solo](http://docs.vagrantup.com/v2/provisioning/chef_solo.html) has more information. 

First, let's update the packages already installed:

    # Update the list of packages
    config.vm.provision :shell, :inline => "sudo apt-get update -y"

This will not actually do the upgrades, for that you will need to run `sudo apt-get upgrade -y`, but `grub` seemed to be giving me errors when trying doing that automatically from the `Vagrantfile`.

You can download cookbooks into your Vagrant repository and configure in the Vagrantfile, or you can use one of the cookbook management tools, such as [berkshelf](http://berkshelf.com/):

    gem install berkshelf

Create the file `Berksfile` and add the following:

    cookbook "git"
    cookbook "nodejs"
    cookbook "redisio"

Add the following line to your `Vagrantfile`:

    # Use [berkshelf](http://berkshelf.com/)
    config.berkshelf.enabled = true

Install [nodejs](http://nodejs.org/), setting the version to the latest stable or what version you need, [redis](http://redis.io/), and [yeoman](http://yeoman.io/), [node-supervisor](https://github.com/isaacs/node-supervisor/), and [http-server](https://github.com/nodeapps/http-server):

    config.vm.provision :chef_solo do |chef|
      chef.json = {
        "nodejs" => {
          "version" => "0.10.7"
        }

      }

      chef.add_recipe "git"
      chef.add_recipe "nodejs"
      chef.add_recipe "redisio::install"
      chef.add_recipe "redisio::enable"

    end

    # install global node modules
    config.vm.provision :shell, :inline => "npm install -g yo grunt-cli bower supervisor http-server"

Note, there are several cookbooks for node.js and redis; this uses the [redisio](https://github.com/brianbianco/redisio/) and the [nodejs](http://community.opscode.com/cookbooks/nodejs) cookbooks.


## Conclusion

At this point, you probably want to install your own software. You can do this from your `Vagrantfile` using `git`, but then you will have to do a `git pull` after all your changes. Another approach is to clone everything inside your vagrant directory and it will then be mounted within the guest VM automatically. Anything that is in the same directory as the `Vagrantfile` will be mounted within the VM in `/vagrant`.

If you have multiple sub-projects, another approach is to put all of your sub-projects under one project-root directory. One way to configure things if you have multiple projects and a separate repo for your vagrant configuration is to set up your directory structure like this:

    - project-root
      - vagrant-config
      - sub-project1
      - sub-project2

And then symlink your `Vagrantfile` to the `project-root` (`ln -s vagrant-config/Vagrantfile .`). Using this approach, you can edit your code in your host OS using [Sublime Text](http://www.sublimetext.com/), or whatever editor you like, and it is automatically changed in the `/vagrant` directory. Alternately, everything will be under your vagrant configuration repo.

To create the VM, run: `vagrant up`. This will take a few minutes as it downloads the [box](http://docs.vagrantup.com/v2/boxes.html), configures the VM, [updates install packages](https://help.ubuntu.com/12.04/serverguide/apt-get.html), and installs the packages listed in the `Vagrantfile`.

Redis should be running already (that is what the `redisio::enable` does). Because port forwarding for the redis port is configured, you can use `redis-cli` from the host OS to connect to the guest (assuming you don't also have redis running on the host).

If you have a nodejs process server set up and running on port 8000 (or if you have it set to start on a different port, change the mapping in the `Vagrantfile`), you can open a browser or use `curl` to access the server from the host OS by going to http://localhost:8000/

To log into the VM, from the directory that has your `Vagrantfile`, do: `vagrant ssh`. Here is [a list of all Vagrant commands](http://docs.vagrantup.com/v2/cli/index.html).

