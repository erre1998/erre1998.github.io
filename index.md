---
layout: default
title: Home
permalink: /
description: "Erik Renz – Digital Humanities, Computational Literary Studies, and Digital Scholarly Editions."
---


<section class="home-about" aria-labelledby="home-about-title">
    <div class="home-about-card">
        <div class="home-profile">

            <!-- Portrait: overlapping the upper-left border of the text card -->
            <figure class="home-profile-photo">
                <img
                    src="{{ '/assets/imgs/2025_renz.png' | relative_url }}"
                    alt="Portrait of Erik Renz"
                    width="238"
                    height="238"
                    loading="eager"
                    decoding="async"
                >
            </figure>

            <div class="home-profile-content">
                <h1 class="home-about-heading" id="home-about-title">About Me</h1>



<div class="home-about-text">

    <p>
        I am a Research Associate in Digital Humanities at the
        University of Rostock, where my work encompasses research,
        teaching and academic service.
    </p>

    <p>
        Trained in History and German Studies, 
        I now conduct research at the intersection of
        Digital Humanities and literary studies. My research
        interests centre on women’s writing and drama, computational
        approaches to literary analysis, and the application of
        digital methods to the editing, analysis and exploration
        of historical texts.
    </p>

    <p>
        These interests also inform my ongoing doctoral research
        at Freie Universität Berlin, which takes the form of a
        cumulative dissertation situated at the intersection of
        Computational Literary Studies and Women’s Studies.
        Focusing on German-language plays written by women during
        the nineteenth century, the project combines the development
        of a full-text corpus, undertaken in connection with the
        <a href="https://dracor.org/"
           target="_blank"
           rel="noopener noreferrer">Drama Corpora (DraCor)</a>
        project, with computational approaches to investigating
        the breadth and diversity of women’s dramatic production
        and its place within literary history.
    </p>

    <p>
        Alongside my research and teaching, I am actively involved in establishing and further 
        developing DH as a field of study at the University of Rostock. This includes contributing 
        to the development of a new bachelor’s degree program (minor) and a European joint master’s 
        degree program in Digital Humanities.
        I am also a co-founder and co-organiser of the
        <a href="https://www.germanistik.uni-rostock.de/en/forschung/digital-humanities/rosdh/"
           target="_blank"
           rel="noopener noreferrer">Rostock Working Group Digital Humanities (RosDH)</a>
        and a member of the
        <a href="https://www.i-d-e.de/"
           target="_blank"
           rel="noopener noreferrer">Institute for Documentology and Scholarly Editing (IDE)</a>.
    </p>

</div>

                <!-- CV generator -->
                <nav
                    class="home-profiles"
                    aria-label="Contact, CV and profiles"
                >

                    <button
                        id="generate-cv-button"
                        class="home-profile-link home-cv-button"
                        type="button"
                        data-name="{{ site.title }}"
                        data-address="Office address: August-Bebel-Straße 28, 18055 Rostock"
                        data-birth-date="Born in 1998 in Güstrow, Germany"
                        data-photo="{{ '/assets/imgs/2025_renz.png' | relative_url }}"
                        data-cv-url="{{ '/cv/' | relative_url }}"
                        data-talks-url="{{ '/talks/' | relative_url }}"
                        data-teaching-url="{{ '/teaching/' | relative_url }}"
                        data-events-url="{{ '/events/' | relative_url }}"
                        data-services-url="{{ '/services/' | relative_url }}"
                        data-projects-url="{{ '/projects/' | relative_url }}"
                        data-zotero-user-id="{{ site.zotero.user_id }}"
                        aria-label="Generate CV as PDF"
                        title="Generate CV as PDF"
                    >
                        <span class="home-profile-label">CV</span>
                    </button>

                    <a
                        class="home-profile-link"
                        href="mailto:erik.renz@uni-rostock.de"
                        aria-label="Email"
                        title="Email"
                    >
                        <svg
                            class="home-profile-icon"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.2l9 5.6 9-5.6V7H3Zm18 10V9.55l-8.47 5.27a1 1 0 0 1-1.06 0L3 9.55V17h18Z"></path>
                        </svg>
                        <span class="home-profile-label">Email</span>
                    </a>

                    <a
                        class="home-profile-link"
                        href="https://orcid.org/0009-0005-8288-7470"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="ORCID"
                        title="ORCID"
                    >
                        <span
                            class="home-profile-icon-mask home-profile-icon-orcid"
                            aria-hidden="true"
                        ></span>
                        <span class="home-profile-label">ORCID</span>
                    </a>

                    <a
                        class="home-profile-link"
                        href="https://github.com/erre1998"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        title="GitHub"
                    >
                        <span
                            class="home-profile-icon-mask home-profile-icon-github"
                            aria-hidden="true"
                        ></span>
                        <span class="home-profile-label">GitHub</span>
                    </a>

                    <a
                        class="home-profile-link"
                        href="https://fedihum.org/@erre1998"
                        target="_blank"
                        rel="me noopener noreferrer"
                        aria-label="FeDiHum"
                        title="FeDiHum"
                    >
                        <span
                            class="home-profile-icon-mask home-profile-icon-mastodon"
                            aria-hidden="true"
                        ></span>
                        <span class="home-profile-label">FeDiHum</span>
                    </a>

                    <span
                        id="generate-cv-status"
                        class="home-cv-status"
                        aria-live="polite"
                    ></span>

                </nav>
            </div>
        </div>
    </div>
</section>

<script
    src="{{ '/assets/vendor/pdfmake/pdfmake.min.js' | relative_url }}"
    defer
></script>

<script
    src="{{ '/assets/vendor/pdfmake/vfs_fonts.js' | relative_url }}"
    defer
></script>

<script
    src="{{ '/assets/js/cv-generator.js' | relative_url }}?v=8"
    defer
></script>
