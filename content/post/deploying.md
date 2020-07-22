+++
date = 2020-07-22T19:36:31+01:00
slug = "deploying"
title = "Showing Other People"
author = "Michael Kuc"

[taxonomies]
tags = [
	"zola",
	"deploy",
	"hosting"
]

categories = [
	"Zola",
	"Deployment",
]
+++

Zola can easily serve the development view of the website, but how do you
actually get that out to the world?

<!-- more -->

The first step is generating the static content for delivering to viewers. This
consists of quite a few steps on Zola's part, but it can be primarily boiled
down to two major steps:

* the content in the `/static` folder is copied across as is
* the posts and other content is transformed into a static representation

For images and other media files, there is no requirement for Zola to process
them, because they don't need to be indexed or manipulated, so these should go
in the `/static` folder.

For writing, this should be placed in the `/content` folder in order to make use
of Zola's automation.

When you run the `zola build` command at the root of the project, you will
generate another folder: `public`, which contains all the static resources for
you to serve to people viewing your website. This will contain all the static
content, as well as the textual content, transformed into HTML.

This then needs to be placed on a server able to serve it to visitors. If you
already have a hosting service, you can just place the contents of the `public`
folder at the root of the website. Otherwise, you can use a VPS service and
install Nginx or Apache to serve the HTML.
