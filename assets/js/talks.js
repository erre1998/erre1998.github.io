document.addEventListener("DOMContentLoaded", () => {

    const talks = Array.from(
        document.querySelectorAll(".talk-item")
    );

    const searchInput =
        document.querySelector("#talks-search");

    const yearFilter =
        document.querySelector("#talks-filter-year");

    const statusFilter =
        document.querySelector("#talks-filter-status");

    const locationFilter =
        document.querySelector("#talks-filter-location");

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
       Build status filter
    ---------------------------------- */

    if (statusFilter) {

        const statuses =
            uniqueValues("status")
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            "en"
                        )
                );


        statuses.forEach(value => {

            const option =
                document.createElement("option");

            option.value =
                value;

            option.textContent =
                value;

            statusFilter.appendChild(option);

        });

    }


    /* ---------------------------------
       Build location filter
    ---------------------------------- */

    if (locationFilter) {

        const locations =
            uniqueValues("location")
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            "en"
                        )
                );


        locations.forEach(value => {

            const option =
                document.createElement("option");

            option.value =
                value;

            option.textContent =
                value;

            locationFilter.appendChild(option);

        });

    }


    /* ---------------------------------
       Filter talks
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

        const selectedLocation =
            locationFilter?.value || "";


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


            const matchesStatus =
                !selectedStatus ||
                talk.dataset.status ===
                    selectedStatus;


            const matchesLocation =
                !selectedLocation ||
                talk.dataset.location ===
                    selectedLocation;


            const matches =
                matchesSearch &&
                matchesYear &&
                matchesStatus &&
                matchesLocation;


            talk.hidden =
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
       Status text
    ---------------------------------- */

    function updateStatus(visibleCount) {

        if (!status) {
            return;
        }


        const total =
            talks.length;


        if (visibleCount === total) {

            status.textContent =
                total === 1
                    ? "1 talk"
                    : `${total} talks`;

        }
        else {

            status.textContent =
                `${visibleCount} of ${total} talks`;

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
        statusFilter,
        locationFilter
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


                if (locationFilter) {
                    locationFilter.value = "";
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