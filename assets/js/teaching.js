document.addEventListener("DOMContentLoaded", () => {

    const courses = Array.from(
        document.querySelectorAll(".teaching-course")
    );

    if (!courses.length) {
        return;
    }


    /* ---------------------------------
       Elements
    ---------------------------------- */

    const searchInput =
        document.querySelector(
            "#teaching-search"
        );

    const filters = {
        term:
            document.querySelector(
                "#filter-term"
            ),

        type:
            document.querySelector(
                "#filter-type"
            )
    };

    const resetButton =
        document.querySelector(
            "#teaching-filter-reset"
        );

    const status =
        document.querySelector(
            "#teaching-filter-status"
        );


    /* ---------------------------------
       Build filter options
    ---------------------------------- */

    Object.entries(filters)
        .forEach(([key, select]) => {

            if (!select) {
                return;
            }


            /*
             * Remove previously generated
             * options while retaining the
             * first "All ..." option.
             */

            while (
                select.options.length > 1
            ) {
                select.remove(1);
            }


            const values = [
                ...new Set(
                    courses
                        .map(
                            course =>
                                course.dataset[key]
                        )
                        .filter(Boolean)
                )
            ];


            /*
             * Terms retain the order in
             * which they occur in the
             * course list.
             *
             * Types are sorted
             * alphabetically.
             */

            if (key === "type") {

                values.sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            "en"
                        )
                );

            }


            values.forEach(value => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    value;

                option.textContent =
                    value;

                select.appendChild(
                    option
                );

            });

        });


    /* ---------------------------------
       Searchable course text
    ---------------------------------- */

    function searchableText(course) {

        /*
         * The search remains deliberately
         * broad even though only Term and
         * Type are available as filters.
         *
         * This means that users can still
         * search for locations, languages,
         * titles, SWS, etc.
         */

        return [
            course.textContent,
            course.dataset.location,
            course.dataset.term,
            course.dataset.type,
            course.dataset.sws,
            course.dataset.language
        ]
            .filter(Boolean)
            .join(" ")
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .toLowerCase();

    }


    /* ---------------------------------
       Apply filters
    ---------------------------------- */

    function applyFilters() {

        const query =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedTerm =
            filters.term
                ? filters.term.value
                : "";


        const selectedType =
            filters.type
                ? filters.type.value
                : "";


        let visibleCount = 0;


        courses.forEach(course => {

            const matchesTerm =
                !selectedTerm ||
                course.dataset.term ===
                    selectedTerm;


            const matchesType =
                !selectedType ||
                course.dataset.type ===
                    selectedType;


            const matchesSearch =
                !query ||
                searchableText(course)
                    .includes(query);


            /*
             * All active filters are
             * combined with AND.
             */

            const matches =
                matchesTerm &&
                matchesType &&
                matchesSearch;


            course.hidden =
                !matches;


            if (matches) {
                visibleCount += 1;
            }

        });


        updateStatus(
            visibleCount
        );

    }


    /* ---------------------------------
       Status
    ---------------------------------- */

    function updateStatus(
        visibleCount
    ) {

        if (!status) {
            return;
        }


        const total =
            courses.length;


        if (
            visibleCount === total
        ) {

            status.textContent =
                `${total} courses`;

            return;

        }


        if (
            visibleCount === 0
        ) {

            status.textContent =
                "No courses found.";

            return;

        }


        status.textContent =
            `${visibleCount} of ${total} courses`;

    }


    /* ---------------------------------
       Reset
    ---------------------------------- */

    function resetFilters() {

        if (searchInput) {

            searchInput.value =
                "";

        }


        Object.values(filters)
            .forEach(select => {

                if (select) {

                    select.value =
                        "";

                }

            });


        applyFilters();

    }


    /* ---------------------------------
       Events
    ---------------------------------- */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    Object.values(filters)
        .forEach(select => {

            if (!select) {
                return;
            }


            select.addEventListener(
                "change",
                applyFilters
            );

        });


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetFilters
        );

    }


    /* ---------------------------------
       Initialise
    ---------------------------------- */

    applyFilters();

});