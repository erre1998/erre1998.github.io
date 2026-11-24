document.addEventListener("DOMContentLoaded", () => {

    const events = Array.from(
        document.querySelectorAll(".event-item")
    );

    const searchInput = document.querySelector(
        "#events-search"
    );

    const yearFilter = document.querySelector(
        "#events-filter-year"
    );

    const typeFilter = document.querySelector(
        "#events-filter-type"
    );

    const resetButton = document.querySelector(
        "#events-filter-reset"
    );

    const status = document.querySelector(
        "#events-filter-status"
    );


    if (!events.length) {
        return;
    }


    /*
     * Helpers
     */

    function getYears(element) {

        return (element.dataset.years || "")
            .split(/\s+/)
            .map(value => value.trim())
            .filter(Boolean);

    }


    function normalize(value) {

        return (value || "")
            .toLocaleLowerCase()
            .trim();

    }


    /*
     * Build year filter
     */

    if (yearFilter) {

        const years = new Set();


        events.forEach(event => {

            getYears(event).forEach(year => {
                years.add(year);
            });


            event
                .querySelectorAll(".event-series-edition")
                .forEach(edition => {

                    getYears(edition).forEach(year => {
                        years.add(year);
                    });

                });

        });


        Array.from(years)
            .sort((a, b) => Number(b) - Number(a))
            .forEach(year => {

                const option =
                    document.createElement("option");

                option.value = year;
                option.textContent = year;

                yearFilter.appendChild(option);

            });

    }


    /*
     * Build event type filter
     */

    if (typeFilter) {

        const types = [
            ...new Set(
                events
                    .map(event =>
                        event.dataset.type
                    )
                    .filter(Boolean)
            )
        ];


        types
            .sort((a, b) =>
                a.localeCompare(b, "en")
            )
            .forEach(type => {

                const option =
                    document.createElement("option");

                option.value = type;
                option.textContent = type;

                typeFilter.appendChild(option);

            });

    }


    /*
     * Apply filters
     */

    function applyFilters() {

        const searchTerm =
            normalize(searchInput?.value);

        const selectedYear =
            yearFilter?.value || "";

        const selectedType =
            typeFilter?.value || "";


        let visibleEvents = 0;


        events.forEach(event => {

            const eventText =
                normalize(event.textContent);


            const matchesSearch =
                !searchTerm ||
                eventText.includes(searchTerm);


            const matchesType =
                !selectedType ||
                event.dataset.type ===
                    selectedType;


            /*
             * Recurring series editions
             */

            const editions = Array.from(
                event.querySelectorAll(
                    ".event-series-edition"
                )
            );


            let matchesYear = true;


            if (editions.length) {

                let visibleEditions = 0;


                editions.forEach(edition => {

                    const editionMatchesYear =
                        !selectedYear ||
                        getYears(edition).includes(
                            selectedYear
                        );


                    edition.hidden =
                        !editionMatchesYear;


                    if (editionMatchesYear) {
                        visibleEditions += 1;
                    }

                });


                matchesYear =
                    !selectedYear ||
                    visibleEditions > 0;

            } else {

                matchesYear =
                    !selectedYear ||
                    getYears(event).includes(
                        selectedYear
                    );

            }


            const matches =
                matchesSearch &&
                matchesYear &&
                matchesType;


            event.hidden = !matches;


            if (matches) {
                visibleEvents += 1;
            }

        });


        updateStatus(visibleEvents);

    }


    /*
     * Status
     */

    function updateStatus(visibleEvents) {

        if (!status) {
            return;
        }


        const totalEvents =
            events.length;


        if (visibleEvents === totalEvents) {

            status.textContent =
                totalEvents === 1
                    ? "1 event"
                    : `${totalEvents} events`;

        } else {

            status.textContent =
                visibleEvents === 1
                    ? `1 of ${totalEvents} events`
                    : `${visibleEvents} of ${totalEvents} events`;

        }

    }


    /*
     * Listeners
     */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    [
        yearFilter,
        typeFilter
    ].forEach(filter => {

        if (filter) {

            filter.addEventListener(
                "change",
                applyFilters
            );

        }

    });


    /*
     * Reset
     */

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


                if (typeFilter) {
                    typeFilter.value = "";
                }


                applyFilters();


                if (searchInput) {
                    searchInput.focus();
                }

            }
        );

    }


    /*
     * Initial state
     */

    applyFilters();

});