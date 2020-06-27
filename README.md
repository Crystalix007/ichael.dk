This is a port of the [Arabica theme for Hugo](https://github.com/nirocfz/arabica) to Zola. You can find a live demo [here](https://zola-arabica.netlify.app/).

![Preview](https://raw.githubusercontent.com/Crystalix007/arabica/master/images/screenshot.png)

## Quickstart

### Preview example site

```sh
$ cd arabica
$ zola serve
```

### Configure Zola

This is the `config.toml` of the example site.

```toml
# The URL the site will be built for
base_url = "https://zola-arabica.netlify.com"
generate_rss = true
compile_sass = true

title = "Zola Arabica"
description = "A minimal Zola theme"
highlight_code = true

taxonomies = [
	{ name = "categories", paginate_by = 3, rss = true },
	{ name = "tags", paginate_by = 3 }
]

[extra]
author = "Michael Kuc"
menus = [ "about.md", "getting_started.md" ]
customJS = []
logoTitle = "Arabica"

postSummaryDateFormat = "%Y-%m"

#twitter = "Your Twitter username"
#facebook = "Your Facebook username"
```

To customise the site, please see the [getting-started page](https://github.com/Crystalix007/arabica/blob/master/content/menus/getting_started.md).

Thanks

* [Zola](https://www.getzola.org/)
* [nirocfz/arabica](https://github.com/nirocfz/arabica)

### Accessibility

Ported as is, Google's Lighthouse tools reports low contrast ratios for some
text elements. For increased accessibility, see the changes made on the
accessibility branch.

## License

See [LICENSE](https://github.com/Crystalix007/arabica/blob/master/LICENSE)
