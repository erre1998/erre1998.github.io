document.addEventListener("DOMContentLoaded", () => {

    const theses = Array.from(
        document.querySelectorAll(".thesis-entry")
    );


    const searchInput =
        document.querySelector(
            "#thesis-search"
        );

    const roleFilter =
        document.querySelector(
            "#thesis-filter-role"
        );

    const resetButton =
        document.querySelector(
            "#thesis-filter-reset"
        );

    const status =
        document.querySelector(
            "#thesis-filter-status"
        );


    if (!theses.length) {
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


    /* ---------------------------------
       Build role filter
    ---------------------------------- */

    if (roleFilter) {

        const roles = [
            ...new Set(
                theses
                    .map(
                        thesis =>
                            thesis.dataset.role
                    )
                    .filter(Boolean)
            )
        ];


        /*
         * Keep supervisor roles
         * in a logical order.
         */

        const roleOrder = [
            "First Supervisor",
            "Second Supervisor"
        ];


        roles.sort(
            (a, b) => {

                const aIndex =
                    roleOrder.indexOf(a);

                const bIndex =
                    roleOrder.indexOf(b);


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


        roles.forEach(role => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                role;

            option.textContent =
                role;

            roleFilter.appendChild(
                option
            );

        });

    }


    /* ---------------------------------
       Apply search and filter
    ---------------------------------- */

    function applyFilters() {

        const searchTerm =
            normalize(
                searchInput?.value
            );

        const selectedRole =
            roleFilter?.value || "";


        let visibleCount = 0;


        theses.forEach(thesis => {

            const thesisText =
                normalize(
                    thesis.textContent
                );


            const matchesSearch =
                !searchTerm ||
                thesisText.includes(
                    searchTerm
                );


            const matchesRole =
                !selectedRole ||
                thesis.dataset.role ===
                    selectedRole;


            const matches =
                matchesSearch &&
                matchesRole;


            thesis.hidden =
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

    function updateStatus(visibleCount) {

        if (!status) {
            return;
        }


        const total =
            theses.length;


        if (visibleCount === total) {

            status.textContent =
                total === 1
                    ? "1 thesis"
                    : `${total} theses`;

        }
        else {

            status.textContent =
                visibleCount === 1
                    ? `1 of ${total} theses`
                    : `${visibleCount} of ${total} theses`;

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
       Role filter
    ---------------------------------- */

    if (roleFilter) {

        roleFilter.addEventListener(
            "change",
            applyFilters
        );

    }


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


                if (roleFilter) {
                    roleFilter.value = "";
                }


                applyFilters();


                if (searchInput) {
                    searchInput.focus();
                }

            }
        );

    }


    /* ---------------------------------
       Initial state
    ---------------------------------- */

    applyFilters();

});