Eko Harita
===

Installation
=====
After cloning the repo, you will need to install Ruby libraries. It's
recommended to use an environment manager for this in case you will run
multiple projects with different dependencies.

Please check [rbenv](https://github.com/rbenv/rbenv) or [rvm](https://rvm.io)
for this. Note that you can also use system Ruby for development, but make sure
you're on a safe and stable version. (>= 2.4.\*)

Then you just use the **bundler** gem to install library files:

``` 
$ gem install bundler
$ bundle install #on project root directory
```

And start the server:

```
$ rackup config.ru
```



Content management
=====

This app does not use a conventional database, it utilizes Google Spreadsheets
for the storage of data. To access the content, you will need to authorize your
Google account with this app and keep the auth file on the development
filesystem. It is ignored by the git repo so you'll need to do it again on the
production server.

Easiest way to do it is to open an interactive console with the app loaded:

```
$ tux
```

and run the method to update the contents from the spreadsheet:

```
>> fetch_content
```

On this step the **google_drive** gem (Ruby library) will provide a link to
authenticate. Just open and follow the steps to get the auth token and paste it
into the interactive console. A file called `stored_token.json` will be created
in project's root folder and further content updates will work smoothly.


