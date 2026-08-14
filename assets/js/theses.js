document.addEventListener("DOMContentLoaded", () => {

    const theses = Array.from(
        document.querySelectorAll(".thesis-entry")
    );


    const searchInput = document.querySelector(
        "#thesis-search"
    );

    const roleFilter = document.querySelector(
        "#thesis-filter-role"
    );

    const supervisorFilter = document.querySelector(
        "#thesis-filter-supervisor"
    );

    const locationFilter = document.querySelector(
        "#thesis-filter-location"
    );

    const termFilter = document.querySelector(
        "#thesis-filter-term"
    );

    const typeFilter = document.querySelector(
        "#thesis-filter-type"
    );

    const languageFilter = document.querySelector(
        "#thesis-filter-language"
    );

    const resetButton = document.querySelector(
        "#thesis-filter-reset"
    );

    const status = document.querySelector(
        "#thesis-filter-status"
    );


    if (!theses.length) {
        return;
    }


    /*
     * Normalize text for searching
     */

    function normalize(value) {

        return (value || "")
            .toLocaleLowerCase()
            .trim();

    }


    /*
     * Filter configuration
     */

    const filters = {
        role: roleFilter,
        supervisor: supervisorFilter,
        location: locationFilter,
        term: termFilter,
        type: typeFilter,
        language: languageFilter
    };


    /*
     * Automatically build filter options
     */

    Object.entries(filters).forEach(
        ([key, select]) => {

            if (!select) {
                return;
            }


            const values = [
                ...new Set(
                    theses
                        .map(thesis =>
                            thesis.dataset[key]
                        )
                        .filter(Boolean)
                )
            ];


            /*
             * Keep terms in the order in which
             * they occur on the page.
             *
             * Sort all other metadata
             * alphabetically.
             */

            if (key !== "term") {

                values.sort((a, b) =>
                    a.localeCompare(b, "en")
                );

            }


            values.forEach(value => {

                const option =
                    document.createElement("option");

                option.value = value;
                option.textContent = value;

                select.appendChild(option);

            });

        }
    );


    /*
     * Apply search and filters
     */

    function applyFilters() {

        const searchTerm =
            normalize(searchInput?.value);


        const selectedFilters = {};

        Object.entries(filters).forEach(
            ([key, select]) => {

                selectedFilters[key] =
                    select?.value || "";

            }
        );


        let visibleCount = 0;


        theses.forEach(thesis => {

            const thesisText =
                normalize(thesis.textContent);


            const matchesSearch =
                !searchTerm ||
                thesisText.includes(searchTerm);


            const matchesMetadata =
                Object.entries(selectedFilters)
                    .every(([key, value]) => {

                        if (!value) {
                            return true;
                        }

                        return thesis.dataset[key] === value;

                    });


            const matches =
                matchesSearch &&
                matchesMetadata;


            thesis.hidden = !matches;


            if (matches) {
                visibleCount += 1;
            }

        });


        updateStatus(visibleCount);

    }


    /*
     * Result status
     */

    function updateStatus(visibleCount) {

        if (!status) {
            return;
        }


        const total =
            theses.length;


        if (visibleCount === total) {

            status.textContent =
                `${total} theses`;

        } else {

            status.textContent =
                `${visibleCount} of ${total} theses`;

        }

    }


    /*
     * Search listener
     */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    /*
     * Filter listeners
     */

    Object.values(filters).forEach(
        select => {

            if (!select) {
                return;
            }

            select.addEventListener(
                "change",
                applyFilters
            );

        }
    );


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


                Object.values(filters).forEach(
                    select => {

                        if (select) {
                            select.value = "";
                        }

                    }
                );


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