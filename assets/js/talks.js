document.addEventListener("DOMContentLoaded", () => {

    /* ---------------------------------
       Talks and posters use the same
       filtering logic but maintain
       separate filter states.
    ---------------------------------- */

    function initializeFilterGroup(config) {

        const items = Array.from(
            document.querySelectorAll(config.itemSelector)
        );

        const searchInput =
            document.querySelector(config.searchSelector);

        const yearFilter =
            document.querySelector(config.yearSelector);

        const countryFilter =
            document.querySelector(config.countrySelector);

        const resetButton =
            document.querySelector(config.resetSelector);

        const status =
            document.querySelector(config.statusSelector);


        if (!items.length) {

            if (status) {
                status.textContent = `0 ${config.plural}`;
            }

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
                    items
                        .map(item => item.dataset[key])
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
           Status text
        ---------------------------------- */

        function updateStatus(visibleCount) {

            if (!status) {
                return;
            }


            const total =
                items.length;


            const label =
                total === 1
                    ? config.singular
                    : config.plural;


            if (visibleCount === total) {

                status.textContent =
                    `${total} ${label}`;

            } else {

                status.textContent =
                    `${visibleCount} of ${total} ${label}`;

            }

        }


        /* ---------------------------------
           Apply filters
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


            items.forEach(item => {

                const searchableText =
                    normalize(
                        item.textContent
                    );


                const matchesSearch =
                    !query ||
                    searchableText.includes(query);


                const matchesYear =
                    !selectedYear ||
                    item.dataset.years ===
                        selectedYear;


                const matchesCountry =
                    !selectedCountry ||
                    item.dataset.country ===
                        selectedCountry;


                const matches =
                    matchesSearch &&
                    matchesYear &&
                    matchesCountry;


                item.hidden =
                    !matches;


                if (matches) {
                    visibleCount += 1;
                }

            });


            /* ---------------------------------
               Keep filter section visible
            ---------------------------------- */

            updateStatus(visibleCount);

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
           Year and country filters
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

    }


    /* =========================================
       TALKS
    ========================================= */

    initializeFilterGroup({

        itemSelector:
            ".talks > .talks-list .talk-item:not(.poster-item)",

        searchSelector:
            "#talks-search",

        yearSelector:
            "#talks-filter-year",

        countrySelector:
            "#talks-filter-country",

        resetSelector:
            "#talks-filter-reset",

        statusSelector:
            "#talks-filter-status",

        singular:
            "talk",

        plural:
            "talks"

    });


    /* =========================================
       POSTERS
    ========================================= */

    initializeFilterGroup({

        itemSelector:
            "#talks-posters .poster-item",

        searchSelector:
            "#posters-search",

        yearSelector:
            "#posters-filter-year",

        countrySelector:
            "#posters-filter-country",

        resetSelector:
            "#posters-filter-reset",

        statusSelector:
            "#posters-filter-status",

        singular:
            "poster",

        plural:
            "posters"

    });

});