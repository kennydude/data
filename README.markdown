DataBin
=======

Welcome. You can view me at http://kennydude.github.com/data/

To add a new bin, you need to get a copy of this on your computer and install Jekyll.

Add into _posts a file something like 2012-04-23-yourpost.json (it must have a date), then type:

	---
	title: TitleOfYourSet
	layout: entry
	---
	{
		"fields" : ["Name", "test"],
		"data" : [
			[ "Entry 1 Name", "Entry 1 test" ],
			[ "Entry 2 Name", "Entry 2 test" ]
		]
	}


And you should be good from there once you regenerate. Fork + Submit a pull request for new stuff please! :D