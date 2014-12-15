Scrappy
=======

A simple utility to help scrap things and save them

[![Build Status](https://travis-ci.org/j33f/Scrappy.svg?branch=master)](https://travis-ci.org/j33f/Scrappy)

**Warning** : work in progress, it's not fully functional yet even if build status is ok !

## Functionnalities

- easy click and select elements on page
- use jQuery selectors (those handled by [Jq2cheerio](https://github.com/j33f/jQ2Cheerio))
- smart actions for elements (detects a, img, p, table) and offers custom actions for these
- smart pagination links handling
- CRUD scrapping projects (use localStorage at the moment)
- export data to JSON, CSV or ZIP of CSV files
- assemble datas automatically if possible

## Try it now

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

or try the demo (may not be up to date) http://scrappy-example.herokuapp.com

## Ideas reminder 

- handle the colspan for tables
- maybe handle the rowspan
- implement scrap for attributes

