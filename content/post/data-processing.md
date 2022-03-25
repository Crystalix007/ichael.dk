+++
date = 2022-03-25T16:30:48+00:00
slug = "data-processing-cli"
title = "Processing a list of values in the terminal"
description = "Given a list of numerical values, how can you compute statistical functions on them?"

[taxonomies]
tags = [
	"cli",
	"statistics",
]

categories = [
  "CLI",
	"Tools"
]
+++

Assuming a list of data in a form such as:

{% namedFile(filename="data") %}
```
1
2
3
...
```
{% end %}

There is a useful tool (`datamash`) which allows us to compute useful
statistics on the data provided.

For example, assuming we wish to compute the mean of the list above, we could
run:

{% cli(command="datamash --header-out mean 1 < data") %}
```
mean(field-1)
2
```
{% end %}

In this example, the `mean 1` part represents that we want the mean of the
first field.

This can also be extended by using [other available processing
operators](https://www.gnu.org/software/datamash/manual/datamash.html#Available-Operations).

For example:

{% cli(command="cat data | datamash --header-out perc:1 1 perc:5 1 perc:10 1 mean 1 perc:50 1 perc:90 1 perc:95 1 perc:99 1 max 1") %}
```
min(field-1)	mean(field-1)	perc:95(field-1)	max(field-1)
1	2	2.9	3
```
{% end %}

One limitation is that `datamash` doesn't correctly align the columns. This can
be resolved by piping through `| column -t`. I also typically pipe the data
through a `sed` filter to remove the field identifiers (given we're only using a
single field here).

{% cli(command="cat data | datamash -s --header-out min 1 mean 1 perc:95 1 max 1 | sed -e 's/(field-1)//g' | column -t") %}
```
min  mean  perc:95  max
1    2     2.9      3
```
{% end %}
