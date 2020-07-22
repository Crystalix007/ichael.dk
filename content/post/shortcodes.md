+++
date = 2020-07-22T19:00:12+01:00
slug = "zola-shortcodes"
author = "Michael Kuc"
title = "Zola's Embeddable Components"
description = '''
How to get complex components into your Markdown. A guide for
including more dynamic components into your static content
'''

[taxonomies]
tags = [
	"shortcodes",
	"zola",
	"development",
	"themes",
	"templates",
]

categories = [
	"Zola",
	"Development",
]
+++

Zola expands upon Markdown's simplistic mark-up functionality and presents the
ability to embed complex, configurable HTML components inline with your content.

Some of the existing shortcodes already available are:

* `{{/* youtube(id="dQw4w9WgXcQ", autoplay=true, class="youtube") */}}`

For adding a video hosted by YouTube to your content.

* `{{/* vimeo(id="124313553", class="vimeo") */}}`

For adding a video hosted by Vimeo to your content.

* `{{/*
	gist(url="https://gist.github.com/Keats/e5fb6aad409f28721c0ba14161644c57",
	class="gist") */}}`

For adding a GitHub Gist to your content.

But see the [official
documentation](https://www.getzola.org/documentation/content/shortcodes#built-in-shortcodes)
to see the conclusive list.

To build your own, you simply need to add the template to the
`templates/shortcodes` subdirectory, creating the `shortcodes` folder if it
doesn't already exist.

For example, to create a shortcode `quote`, you would create the file
`templates/shortcodes/quote.html`, in which you could stick:

```html
<div class="quote {%- if capitalised %} capitalised {%- endif %-}">
	{{ body }}
</div>
```

Here, you could use the new quote shortcode with:

```md
And it has been said:

{%/* quote(capitalised=true) */%}
that most statistics are made up.
{%/* end */%}
```

This can obviously help reduce the amount of copy-and-pasting involved in using
a consistent set of components across your content.
