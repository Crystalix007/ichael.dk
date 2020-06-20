+++
date = 2020-06-23T18:30:36+01:00
slug = "zola-pagination"
title = "How pagination works in Zola"
author = "Michael Kuc"

[taxonomies]
tags = [
	"pagination",
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

Zola pagination is performed on both sections and taxonomies. For sections, This
happens automatically when the correct variables are set on the section
variable.

<!-- more -->

On the section page `_index.md` for the respective section, `paginate_by` needs
to be set to a positive number.

This will automatically populate the `paginator` variable in the `section`
context. The same is available for taxonomies. A description of the information
available to a paginated section or taxonomy is provided in [Zola's
documentation](https://www.getzola.org/documentation/templates/pagination/).
