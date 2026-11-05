
document.addEventListener("DOMContentLoaded", () => {

    const talks = Array.from(
        document.querySelectorAll(".talk-item")
    );

    const posterSection =
        document.querySelector("#talks-posters");

    const searchInput =
        document.querySelector("#talks-search");

    const yearFilter =
        document.querySelector("#talks-filter-year");

    const countryFilter =
        document.querySelector("#talks-filter-country");

    const resetButton =
        document.querySelector("#talks-filter-reset");

    const status =
        document.querySelector("#talks-filter-status");


    if (!talks.length) {
        return;
    }


    /* ---------------------------------
       Helpers
    ---------------------------------- */

    function normalize(value) {

        return String(value || "")
            .toLocaleLowerCase()
            .trim();

    }


    function uniqueValues(key) {

        return [
            ...new Set(
                talks
                    .map(
                        talk =>
                            talk.dataset[key]
                    )
                    .filter(Boolean)
            )
        ];

    }


    /* ---------------------------------
       Build year filter
    ---------------------------------- */

    if (yearFilter) {

        const years =
            uniqueValues("years")
                .sort(
                    (a, b) =>
                        Number(b) - Number(a)
                );


        years.forEach(year => {

            const option =
                document.createElement("option");

            option.value =
                year;

            option.textContent =
                year;

            yearFilter.appendChild(option);

        });

    }


    /* ---------------------------------
       Build country filter
    ---------------------------------- */

    if (countryFilter) {

        const countries =
            uniqueValues("country")
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            "en"
                        )
                );


        countries.forEach(country => {

            const option =
                document.createElement("option");

            option.value =
                country;

            option.textContent =
                country;

            countryFilter.appendChild(option);

        });

    }


    /* ---------------------------------
       Filter talks and posters
    ---------------------------------- */

    function applyFilters() {

        const query =
            normalize(
                searchInput?.value
            );

        const selectedYear =
            yearFilter?.value || "";

        const selectedCountry =
            countryFilter?.value || "";


        let visibleCount = 0;


        talks.forEach(talk => {

            const searchableText =
                normalize(
                    talk.textContent
                );


            const matchesSearch =
                !query ||
                searchableText.includes(query);


            const matchesYear =
                !selectedYear ||
                talk.dataset.years ===
                    selectedYear;


            const matchesCountry =
                !selectedCountry ||
                talk.dataset.country ===
                    selectedCountry;


            const matches =
                matchesSearch &&
                matchesYear &&
                matchesCountry;


            talk.hidden =
                !matches;


            if (matches) {
                visibleCount += 1;
            }

        });


        /* ---------------------------------
           Poster section visibility
        ---------------------------------- */

        if (posterSection) {

            const visiblePosters = talks.some(talk =>
                talk.classList.contains("poster-item") &&
                !talk.hidden
            );

            posterSection.hidden = !visiblePosters;

        }


        updateStatus(visibleCount);

    }


    /* ---------------------------------
       Status text
    ---------------------------------- */

    function updateStatus(visibleCount) {

        if (!status) {
            return;
        }


        const talkEntries = talks.filter(talk =>
            !talk.classList.contains("poster-item")
        );


        const posterEntries = talks.filter(talk =>
            talk.classList.contains("poster-item")
        );


        const visibleTalks = talkEntries.filter(
            talk => !talk.hidden
        ).length;


        const visiblePosters = posterEntries.filter(
            talk => !talk.hidden
        ).length;


        const formatCount = (
            visible,
            total,
            singular,
            plural
        ) => {

            const label =
                total === 1 ? singular : plural;

            return visible === total
                ? `${total} ${label}`
                : `${visible} of ${total} ${label}`;

        };


        const parts = [
            formatCount(
                visibleTalks,
                talkEntries.length,
                "talk",
                "talks"
            )
        ];


        if (posterEntries.length) {

            parts.push(
                formatCount(
                    visiblePosters,
                    posterEntries.length,
                    "poster",
                    "posters"
                )
            );

        }


        status.textContent = parts.join(" · ");

    }


    /* ---------------------------------
       Search
    ---------------------------------- */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    /* ---------------------------------
       Filters
    ---------------------------------- */

    [
        yearFilter,
        countryFilter
    ]
        .filter(Boolean)
        .forEach(select => {

            select.addEventListener(
                "change",
                applyFilters
            );

        });


    /* ---------------------------------
       Reset
    ---------------------------------- */

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value = "";
                }


                if (yearFilter) {
                    yearFilter.value = "";
                }


                if (countryFilter) {
                    countryFilter.value = "";
                }


                applyFilters();


                if (searchInput) {
                    searchInput.focus();
                }

            }
        );

    }


    /* ---------------------------------
       Initialise
    ---------------------------------- */

    applyFilters();

});
