---
title: The Living Liturgy
layout: layout.njk
---

The **Liturgy of the Kinheart Assembly** is a living document — updated through careful review and consensus.

- See the [Changelog](/changelog/) for notable revisions.
- Browse sections below:

<ul>
{% for item in collections.liturgy %}
  {% if item.inputPath !== "liturgy/index.md" %}
  <li><a href="{{ item.url }}">{{ item.data.title or item.fileSlug }}</a></li>
  {% endif %}
{% endfor %}
</ul>
