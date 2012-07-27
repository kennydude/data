---
layout: default
---
<div class="page-header">

<h1>Welcome to the DataBin
<small>
	This is a very simple Jekyll based site allowing you to get access
	to readily available information, just much more dev-friendly! ^__^
</small></h1>
</div>

<h2>Data here:</h2>
<table class="table table-striped table-bordered table-condensed">
<tr><th>Data Name</th><th>Description</th></tr>
{% for post in site.posts %}
<tr>
<td><a href="{{ post.url | remove_first:'/' }}">{{ post.title }}</a></td>
<td>{{ post.description }}</td>
</tr>
{% endfor %}
</table>
