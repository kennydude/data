---
layout: default
---

<h1>Hello</h1>
<p>
	This is a very simple Jekyll based site allowing you to get access
	to readily available information, just much more dev-friendly! ^__^
</p>

<h2>Data here:</h2>
<ul>
{% for post in site.posts %}
<li>
<a href="{{ post.url }}">{{ post.title }}</a>
</li>
{% endfor %}
</ul>