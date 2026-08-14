document.addEventListener("DOMContentLoaded", () => {

    const events = Array.from(
        document.querySelectorAll(".event-item")
    );

    const yearFilter = document.querySelector(
        "#events-filter-year"
    );

    const resetButton = document.querySelector(
        "#events-filter-reset"
    );

    const status = document.querySelector(
        "#events-filter-status"
    );


    if (!events.length || !yearFilter) {
        return;
    }


    /*
     * Convert a data-years value such as
     * "2025 2026" into an array:
     *
     * ["2025", "2026"]
     */

    function getYears(element) {

        return (element.dataset.years || "")
            .split(/\s+/)
            .map(year => year.trim())
            .filter(Boolean);

    }


    /*
     * Determine whether an element belongs
     * to the selected year.
     */

    function matchesYear(element, selectedYear) {

        if (!selectedYear) {
            return true;
        }

        return getYears(element).includes(selectedYear);

    }


    /*
     * Collect all available years.
     *
     * We read years both from main events
     * and from individual editions of
     * recurring series.
     */

    const allYears = new Set();


    events.forEach(event => {

        getYears(event).forEach(year => {
            allYears.add(year);
        });


        const editions = event.querySelectorAll(
            ".event-series-edition"
        );


        editions.forEach(edition => {

            getYears(edition).forEach(year => {
                allYears.add(year);
            });

        });

    });


    /*
     * Add years to the filter automatically,
     * newest first.
     */

    Array.from(allYears)
        .sort((a, b) => Number(b) - Number(a))
        .forEach(year => {

            const option = document.createElement("option");

            option.value = year;
            option.textContent = year;

            yearFilter.appendChild(option);

        });


    /*
     * Filter the page.
     */

    function applyFilter() {

        const selectedYear = yearFilter.value;

        let visibleEvents = 0;


        events.forEach(event => {

            const editions = Array.from(
                event.querySelectorAll(
                    ".event-series-edition"
                )
            );


            /*
             * ---------------------------------
             * Standalone events
             * ---------------------------------
             *
             * Examples:
             * DraCor Hackathon
             * FORGE 2025
             */

            if (!editions.length) {

                const eventMatches =
                    matchesYear(
                        event,
                        selectedYear
                    );


                event.hidden = !eventMatches;


                if (eventMatches) {
                    visibleEvents += 1;
                }


                return;

            }


            /*
             * ---------------------------------
             * Recurring event / lecture series
             * ---------------------------------
             *
             * Filter individual editions first.
             */

            let visibleEditions = 0;


            editions.forEach(edition => {

                const editionMatches =
                    matchesYear(
                        edition,
                        selectedYear
                    );


                edition.hidden = !editionMatches;


                if (editionMatches) {
                    visibleEditions += 1;
                }

            });


            /*
             * The main lecture-series entry remains
             * visible if:
             *
             * 1. no year filter is active, or
             * 2. at least one edition belongs
             *    to the selected year.
             */

            const eventMatches =
                !selectedYear ||
                visibleEditions > 0;


            event.hidden = !eventMatches;


            if (eventMatches) {
                visibleEvents += 1;
            }

        });


        updateStatus(
            selectedYear,
            visibleEvents
        );

    }


    /*
     * Update the small result indicator.
     */

    function updateStatus(
        selectedYear,
        visibleEvents
    ) {

        if (!status) {
            return;
        }


        const totalEvents = events.length;


        if (!selectedYear) {

            status.textContent =
                `${totalEvents} events`;

            return;

        }


        status.textContent =
            `${visibleEvents} of ${totalEvents} events in ${selectedYear}`;

    }


    /*
     * Apply filter when year changes.
     */

    yearFilter.addEventListener(
        "change",
        applyFilter
    );


    /*
     * Reset.
     */

    if (resetButton) {

        resetButton.addEventListener(
            "click",
            () => {

                yearFilter.value = "";

                applyFilter();

                yearFilter.focus();

            }
        );

    }


    /*
     * Initial state.
     */

    applyFilter();

});