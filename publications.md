---
layout: page
title: Publications
permalink: /publications/
description: "Publications by Erik Renz."
---

<div
    id="publications-app"
    data-zotero-user-id="{{ site.zotero.user_id }}"
    data-zotero-url="https://www.zotero.org/{{ site.zotero.username }}/publications"
>

    <p class="publications-intro">
        Publications are automatically retrieved from my
        <a
            href="https://www.zotero.org/{{ site.zotero.username }}/publications"
            target="_blank"
            rel="noopener noreferrer"
        >Zotero library</a>.
    </p>

    <div class="pub-toolbar">

        <input
            id="pub-search"
            type="search"
            placeholder="Search publications"
            aria-label="Search publications"
        >

        <select
            id="pub-year"
            aria-label="Filter publications by year"
        >
            <option value="">All years</option>
        </select>

        <select
            id="pub-category"
            aria-label="Filter publications by category"
        >
            <option value="">All categories</option>
        </select>

        <button
            id="pub-reset"
            type="button"
        >
            Reset
        </button>

        <button
            id="pub-print"
            type="button"
        >
            Export as PDF
        </button>

    </div>

    <p
        id="pub-status"
        class="pub-status"
        aria-live="polite"
    >
        Loading publications…
    </p>

    <div id="bibliography"></div>

    <noscript>
        <p>
            JavaScript is required to display the publication list.
            Publications are also available on
            <a href="https://www.zotero.org/{{ site.zotero.username }}/publications">
                Zotero
            </a>.
        </p>
    </noscript>

</div>

<script
    src="{{ '/assets/js/publications.js' | relative_url }}"
    defer
></script>