<section class="home">

    <div class="home-layout">


        <!-- =========================================
             Portrait
        ========================================== -->

        <div class="home-portrait-column">

            <figure class="home-portrait">

                <img
                    src="{{ '/assets/imgs/2025_renz.png' | relative_url }}"
                    alt="Portrait of Erik Renz"
                >

                <figcaption class="home-portrait-credit">
                    Photo: Tim Bünning.
                </figcaption>

            </figure>

        </div>



        <!-- =========================================
             Main content
        ========================================== -->

        <div class="home-content-card">


            <!-- =====================================
                 Introduction
            ====================================== -->

            <div class="home-intro">

                <p>
                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                </p>

                <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                </p>

            </div>



            <!-- =====================================
                 Current position
            ====================================== -->

            <div class="home-position">

                <span class="home-position-label">
                    Current position
                </span>

                <a
                    class="home-position-link"
                    href="https://www.germanistik.uni-rostock.de/en/staff/research-associates/erik-renz/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Research Associate · Junior Professorship for Digital Humanities
                </a>

                <span class="home-position-institution">
                    University of Rostock
                </span>

            </div>



            <!-- =====================================
                 Contact, CV and profiles
            ====================================== -->

            <nav
                class="home-profiles"
                aria-label="Contact, CV and profiles"
            >

                <!-- CV -->

                <button
                    id="generate-cv-button"
                    class="home-profile-link home-cv-button"
                    type="button"

                    data-name="{{ site.title }}"

                    data-address="Office address: August-Bebel-Straße 28, 18055 Rostock"
                    data-birth-date="Born in 1998 in Güstrow"

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

                    <span class="home-profile-label">
                        CV
                    </span>

                </button>


                <!-- Email -->

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
                        <path
                            d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.2l9 5.6 9-5.6V7H3Zm18 10V9.55l-8.47 5.27a1 1 0 0 1-1.06 0L3 9.55V17h18Z"
                        ></path>
                    </svg>

                    <span class="home-profile-label">
                        Email
                    </span>

                </a>



                <!-- ORCID -->

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

                    <span class="home-profile-label">
                        ORCID
                    </span>

                </a>



                <!-- GitHub -->

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

                    <span class="home-profile-label">
                        GitHub
                    </span>

                </a>



                <!-- Fedihum -->

                <a
                    class="home-profile-link"
                    href="https://fedihum.org/@erre1998"
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label="Fedihum"
                    title="Fedihum"
                >

                    <span
                        class="home-profile-icon-mask home-profile-icon-mastodon"
                        aria-hidden="true"
                    ></span>

                    <span class="home-profile-label">
                        Fedihum
                    </span>

                </a>


                <!-- CV generation status -->

                <span
                    id="generate-cv-status"
                    class="home-cv-status"
                    aria-live="polite"
                ></span>

            </nav>

        </div>

    </div>

</section>



<!-- =========================================
     CV PDF generation
========================================== -->

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