document.addEventListener("DOMContentLoaded", () => {

    const courses = Array.from(
        document.querySelectorAll(".teaching-course")
    );

    if (!courses.length) {
        return;
    }


    const filters = {
        location: document.querySelector("#filter-location"),
        term: document.querySelector("#filter-term"),
        type: document.querySelector("#filter-type"),
        language: document.querySelector("#filter-language"),
        sws: document.querySelector("#filter-sws")
    };


    const resetButton = document.querySelector(
        "#teaching-filter-reset"
    );

    const status = document.querySelector(
        "#teaching-filter-status"
    );


    /*
     * Build filter options automatically
     * from course metadata.
     */

    Object.entries(filters).forEach(([key, select]) => {

        if (!select) {
            return;
        }


        const values = [
            ...new Set(
                courses
                    .map(course => course.dataset[key])
                    .filter(Boolean)
            )
        ];


        /*
         * Terms stay in the same chronological
         * order as the courses.
         * Other values are sorted alphabetically.
         */

        if (key !== "term") {
            values.sort((a, b) =>
                a.localeCompare(b, "en")
            );
        }


        values.forEach(value => {

            const option = document.createElement("option");

            option.value = value;
            option.textContent = value;

            select.appendChild(option);

        });

    });


    function applyFilters() {

        const activeFilters = {};

        Object.entries(filters).forEach(([key, select]) => {

            activeFilters[key] = select
                ? select.value
                : "";

        });


        let visibleCount = 0;


        courses.forEach(course => {

            const matches = Object.entries(activeFilters)
                .every(([key, value]) => {

                    if (!value) {
                        return true;
                    }

                    return course.dataset[key] === value;

                });


            course.hidden = !matches;


            if (matches) {
                visibleCount += 1;
            }

        });


        if (status) {

            const total = courses.length;

            if (visibleCount === total) {

                status.textContent =
                    `${total} courses`;

            } else {

                status.textContent =
                    `${visibleCount} of ${total} courses`;

            }

        }

    }


    Object.values(filters).forEach(select => {

        if (!select) {
            return;
        }

        select.addEventListener(
            "change",
            applyFilters
        );

    });


    if (resetButton) {

        resetButton.addEventListener("click", () => {

            Object.values(filters).forEach(select => {

                if (select) {
                    select.value = "";
                }

            });


            applyFilters();

        });

    }


    applyFilters();

});