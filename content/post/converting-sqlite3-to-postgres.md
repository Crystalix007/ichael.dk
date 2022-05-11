+++
date = 2022-05-11T10:10:25+01:00
title = "Converting a SQLite Database to PostgreSQL"
author = "Michael Kuc"
description = "How do you convert a database from SQLite format to PostgreSQL and avoid encoding issues"

[taxonomies]
tags = [
	"database",
	"unicode",
	"encoding",
	"utf-8",
]

categories = [
	"Databases",
]
+++

Recently, I had a substantial database stored in an SQLite format, and needed to
import it into a PostgreSQL database. This required a significant number of
transformations to clean up the content.

# PGLoader

My recommendation for converting the format from SQLite to Postgres is
[PGLoader][pgloader docs]. Specifically, PGLoader [has documentation][pgloader
sqlite] for importing SQLite databases.

This requires a script which specifies what actions PGLoader should take. I
adapted the documentation example for my own purposes:

```
LOAD DATABASE
FROM sqlite:///path/to/sqlite/db.sqlite
INTO postgresql://username:password@host:port/db
WITH include drop, create tables, create indexes, reset sequences, on error resume next
SET work_mem to '128MB', maintenance_work_mem to '1024 MB';
```

This will delete any existing data, but see [PGLoader 'With' options][pgloader
with options] if you would prefer alternative functionality.

Then, save this to a file, like `sqlite.load`, and run:

```sh
pgloader --verbose sqlite.load
```

The `--verbose` flag will allow you to see more details about any errors which
occur.

# Dealing with Invalid Encoding

Unfortunately, during my import, I encountered the error:

```
ERROR Illegal :UTF-8 character needs more reporting
```

This killed the import of the remaining data in the table, so I needed to clean
this data before import.

Please note, the following steps replicate the data several times, so ensure
that you have enough storage to store these intermediate copies (you will
probably need about 5 times the original SQLite DB's storage space).
Alternatively, it *is* possible to stream the commands listed with pipes,
however, this will not preserve the intermediary results if a command fails.

## Dumping SQLite Data

The first step is getting the data in a textual format that commandline tools
can process (i.e. not the binary format used by SQLite).

```sh
sqlite3 /path/to/sqlite/db.sqlite .dump > dump.sql
```

## Filtering Invalid UTF-8

This can then be processed by `uconv`, a tool from the [ICU tools][ICU tools],
however, this is likely already packaged for your distribution.

```sh
uconv --callback skip -t utf8 dump.sql -o dump_utf8.sql
```

Here, I uses the `skip` callback, which simply discards any invalid UTF-8 byte
sequences, however, there are many other escaping or replacement options
available, see [`uconv`'s manual page][uconv manpage].

## Restoring the SQL Dump

`pgloader` needs an SQLite database to load data from, therefore, I proceeded to
load this modified dump into a new SQLite database:

```sh
sqlite /path/to/sqlite/db_utf8.sqlite < dump_utf8.sql
```

## Loading the Cleaned SQLite DB

This DB can now be loaded with `pgloader` into the PostgreSQL database as
[before](#pgloader). Just make sure to replace the database imported with
`FROM`, with your new `db_utf8.sqlite` file:

```
FROM sqlite:///path/to/sqlite/db_utf8.sqlite
```

## Cleanup

After verifying that all the imported data was processed:

```
             table name     errors       read   imported      bytes      total time       read      write
-----------------------  ---------  ---------  ---------  ---------  --------------  ---------  ---------
                  fetch          0          0          0                     0.000s
        fetch meta data          0         18         18                     0.143s
         Create Schemas          0          0          0                     0.000s
       Create SQL Types          0          0          0                     0.017s
          Create tables          0         14         14                     0.100s
         Set Table OIDs          0          7          7                     0.023s
-----------------------  ---------  ---------  ---------  ---------  --------------  ---------  ---------
                 table1          0    3080230    3080230   421.7 MB        3m9.205s   3m2.768s  2m50.694s
                 table2          0  104150000  104150000     8.3 GB     1h3m14.511s  1h3m9.381s  56m7.111s
-----------------------  ---------  ---------  ---------  ---------  --------------  ---------  ---------
COPY Threads Completion          0          4          4                1h6m27.182s
         Create Indexes          0         10         10                 19m33.343s
 Index Build Completion          0         10         10                   6m8.346s
        Reset Sequences          0          0          0                     0.200s
           Primary Keys          0          6          6                    56.408s
    Create Foreign Keys          1          1          0                     0.010s
        Create Triggers          0          0          0                     0.000s
       Install Comments          0          0          0                     0.000s
-----------------------  ---------  ---------  ---------  ---------  --------------  ---------  ---------
      Total import time          1  113416301  113416301     9.1 GB     1h33m5.489s
```

I.e., ensure that the `read` and `imported` columns are the same for all data
you need imported.

Now, you can delete all the temporary files:

```sh
rm /path/to/sqlite/db_utf8.sqlite
rm dump.sql dump_utf8.sql
# If you wish to delete the original DB
rm /path/to/sqlite/db.sqlite
```

[pgloader docs]: https://pgloader.readthedocs.io/en/latest/intro.html
[pgloader sqlite]: https://pgloader.readthedocs.io/en/latest/ref/sqlite.html
[pgloader with options]: https://pgloader.readthedocs.io/en/latest/ref/sqlite.html#sqlite-database-migration-options-with
[ICU tools]: https://icu.unicode.org/home
[uconv manpage]: https://man7.org/linux/man-pages/man1/uconv.1.html#CALLBACKS
