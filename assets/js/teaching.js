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
        document.querySelector("#teaching-search");

    const filters = {
        location:
            document.querySelector("#filter-location"),

        term:
            document.querySelector("#filter-term"),

        type:
            document.querySelector("#filter-type"),

        sws:
            document.querySelector("#filter-sws"),

        language:
            document.querySelector("#filter-language")
    };

    const resetButton =
        document.querySelector("#teaching-filter-reset");

    const status =
        document.querySelector("#teaching-filter-status");


    /* ---------------------------------
       Build filter options
    ---------------------------------- */

    Object.entries(filters)
        .forEach(([key, select]) => {

            if (!select) {
                return;
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
             * Terms retain the chronological
             * order of the course list.
             */

            if (key !== "term") {

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
            .replace(/\s+/g, " ")
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


        const activeFilters = {};

        Object.entries(filters)
            .forEach(([key, select]) => {

                activeFilters[key] =
                    select
                        ? select.value
                        : "";

            });


        let visibleCount = 0;


        courses.forEach(course => {

            const matchesMetadata =
                Object.entries(activeFilters)
                    .every(
                        ([key, value]) => {

                            if (!value) {
                                return true;
                            }

                            return (
                                course.dataset[key] ===
                                value
                            );

                        }
                    );


            const matchesSearch =
                !query ||
                searchableText(course)
                    .includes(query);


            const matches =
                matchesMetadata &&
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

    function updateStatus(visibleCount) {

        if (!status) {
            return;
        }


        const total =
            courses.length;


        if (visibleCount === total) {

            status.textContent =
                `${total} courses`;

            return;

        }


        if (visibleCount === 0) {

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
            searchInput.value = "";
        }


        Object.values(filters)
            .forEach(select => {

                if (select) {
                    select.value = "";
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