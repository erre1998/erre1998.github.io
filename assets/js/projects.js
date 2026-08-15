document.addEventListener("DOMContentLoaded", () => {

    const projects = Array.from(
        document.querySelectorAll(".project-item")
    );


    const searchInput =
        document.querySelector(
            "#projects-search"
        );

    const yearFilter =
        document.querySelector(
            "#projects-filter-year"
        );

    const statusFilter =
        document.querySelector(
            "#projects-filter-status"
        );

    const resetButton =
        document.querySelector(
            "#projects-filter-reset"
        );

    const status =
        document.querySelector(
            "#projects-filter-status"
        );


    if (!projects.length) {
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


    function projectYears(project) {

        return String(
            project.dataset.years || ""
        )
            .split(/\s+/)
            .map(
                year =>
                    year.trim()
            )
            .filter(Boolean);

    }


    /* ---------------------------------
       Build year filter
    ---------------------------------- */

    if (yearFilter) {

        const years = [
            ...new Set(
                projects.flatMap(
                    project =>
                        projectYears(project)
                )
            )
        ]
            .sort(
                (a, b) =>
                    Number(b) -
                    Number(a)
            );


        years.forEach(year => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                year;

            option.textContent =
                year;

            yearFilter.appendChild(
                option
            );

        });

    }


    /* ---------------------------------
       Build status filter
    ---------------------------------- */

    if (statusFilter) {

        const statusOrder = [
            "Upcoming",
            "Current",
            "Completed"
        ];


        const values = [
            ...new Set(
                projects
                    .map(
                        project =>
                            project.dataset.status
                    )
                    .filter(Boolean)
            )
        ];


        values.sort(
            (a, b) => {

                const aIndex =
                    statusOrder.indexOf(a);

                const bIndex =
                    statusOrder.indexOf(b);


                if (
                    aIndex !== -1 &&
                    bIndex !== -1
                ) {
                    return aIndex - bIndex;
                }


                if (aIndex !== -1) {
                    return -1;
                }


                if (bIndex !== -1) {
                    return 1;
                }


                return a.localeCompare(
                    b,
                    "en"
                );

            }
        );


        values.forEach(value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value;

            option.textContent =
                value;

            statusFilter.appendChild(
                option
            );

        });

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


        const selectedStatus =
            statusFilter?.value || "";


        let visibleCount = 0;


        projects.forEach(project => {

            const searchableText =
                normalize(
                    project.textContent
                );


            const years =
                projectYears(project);


            const matchesSearch =
                !query ||
                searchableText.includes(
                    query
                );


            const matchesYear =
                !selectedYear ||
                years.includes(
                    selectedYear
                );


            const matchesStatus =
                !selectedStatus ||
                project.dataset.status ===
                    selectedStatus;


            const matches =
                matchesSearch &&
                matchesYear &&
                matchesStatus;


            project.hidden =
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
       Result status
    ---------------------------------- */

    function updateStatus(
        visibleCount
    ) {

        if (!status) {
            return;
        }


        const total =
            projects.length;


        if (
            visibleCount === total
        ) {

            status.textContent =
                total === 1
                    ? "1 project"
                    : `${total} projects`;

        }
        else {

            status.textContent =
                visibleCount === 1
                    ? `1 of ${total} projects`
                    : `${visibleCount} of ${total} projects`;

        }

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
        statusFilter
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


                if (statusFilter) {
                    statusFilter.value = "";
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