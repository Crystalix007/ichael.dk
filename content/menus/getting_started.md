+++
title = "Getting Started"
date = 2020-06-20T18:58:45+01:00
menu = "main"
+++

# Step 1. Install Zola

Go to [Zola's installation
documentation](https://www.getzola.org/documentation/getting-started/installation/)
and install as recommended.

# Step 2. Clone this repository

Use `git` to clone this repository:

```sh
git clone https://github.com/Crystalix007/arabica.git
```

# Step 3. Replace the pre-populated content with your own content

## Blog posts

You should edit `content/post/*`.
To add a new post, just fill it with the required front-matter:

```toml
+++
author = "You"
date = the-date-now
title = "A title for your blog post"
description = "A description of your blog post"

# Obviously, the image part is optional
[extra.image]
url = "https://some.domain/path"
alt = "A description for screen-readers"
+++
```

The date can either be in the `year-month-day` format, i.e. `2000-06-11` for the
11th of June, 2000; or the date can be written more precisely in the ISO-8601
standard: `2000-06-11T14:22:08-07:00` for 8 seconds past 2:22 pm the same day,
according to GMT-7.

The `alt` text for the image is also technically optional, but recommended for
accessibility.

The **content** of the post can be written afterwards in conventional Markdown
format.

## Site title

The main title, written in large font can be modified by changing the
`logoTitle` variable in `config.toml`, under the `[extra]` section header.

To change the title displayed in the tab / site header, you need to change the
`title` variable in the same file.

Similarly for the description.

## Post date format

The post date format can be changed by modifying the date string in the
`config.toml` file, under the `[extra]` section header. Set the
`postSummaryDateFormat` to be whatever format string you want.

The full documentation of the available `%`-escape sequences is available on
[rust's chrono crate documentation
page](https://docs.rs/chrono/0.4.11/chrono/format/strftime/index.html).

## Menu sections (the things under the title)

To edit an existing section, see the files under `content/menus`. These can be
edited the same way as any normal post.

To add a new section, see the `config.toml`, and simply add a section to the
`menus` array under the `[extra]` section title. This needs to be the filename
(which is specified relative to `content/menus/`, so `content/menus/a.md` would
be simply `"a.md"` in the array.

## Social Media

To add your social media identities, see `config.toml`. There are existing
place-holders for twitter and facebook.

If you want to add your own form of social media, simply add a key here, like
`brand = "some string"`. You can then refer to this in
`templates/partials/footer.html`, with the key `config.extra.brand`.

## Tags

`Zola` comes with very powerful tagging capabilities. There are two types of
tags present by default in this template: `categories`, and `tags`.

Categories are currently not accessible without the direct link `/categories`.
However, they are automatically inserted into the RSS feed. To use these, add a
`[taxonomies]` section header into your front-matter, or use the existing
section title. Under it, put an array of categories the current page belongs to:
`categories = [ "a", "b", "c", "d" ]`.

Tags are also in this template by default. These can be seen at the bottom of
posts, and generate can be clicked to link to a list of other posts with the
same tags assigned to them. By default, these are not added to the RSS feed. To
add these to a post, do as above, except set `tags` instead: `tags = [ "a",
"list", "of", "tags" ]`.

# Test your site

Assuming `zola` is available in your path, just run `zola serve`. This should
spit out a URL like `http://localhost:1111/`. Go to this address in your
browser, and you should see your home page resplendent with all your recent
posts.

# Deploy your site

Assuming you set the base-url of the site, available in `config.toml`, with the
`base_url` variable, you can simply run `zola build`. This will create a
`public` directory, which you can then host with any web server you want.

The root of the web server should point to the `public` folder in order to get
assets correctly delivered.
