
/* =========================================
   Talks & Posters
   Search, filters and chronological sorting
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* =========================================
       General filter functionality
    ========================================= */

    function initializeFilters(config) {

        const container = document.querySelector(config.container);

        const searchInput = document.getElementById(config.searchId);
        const yearSelect = document.getElementById(config.yearId);
        const countrySelect = document.getElementById(config.countryId);
        const resetButton = document.getElementById(config.resetId);
        const statusElement = document.getElementById(config.statusId);


        // Stop if the required elements do not exist.

        if (
            !container ||
            !searchInput ||
            !yearSelect ||
            !countrySelect ||
            !resetButton ||
            !statusElement
        ) {
            return;
        }


        // Select only entries belonging to this section.

        const items = Array.from(
            container.querySelectorAll(config.itemSelector)
        );


        /* -----------------------------------------
           Normalize text for searching
        ----------------------------------------- */

        function normalizeText(value) {

            return String(value || "")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLocaleLowerCase()
                .replace(/\s+/g, " ")
                .trim();

        }


        /* -----------------------------------------
           Extract available years
        ----------------------------------------- */

        const years = new Set();

        items.forEach(function (item) {

            const itemYears = (item.dataset.years || "")
                .split(/\s+/)
                .filter(Boolean);

            itemYears.forEach(function (year) {

                years.add(year);

            });

        });


        const sortedYears = Array.from(years).sort(function (a, b) {

            return Number(b) - Number(a);

        });


        sortedYears.forEach(function (year) {

            const option = document.createElement("option");

            option.value = year;
            option.textContent = year;

            yearSelect.appendChild(option);

        });


        /* -----------------------------------------
           Extract available countries
        ----------------------------------------- */

        const countries = new Set();

        items.forEach(function (item) {

            const country = (item.dataset.country || "").trim();

            if (country) {

                countries.add(country);

            }

        });


        const sortedCountries = Array.from(countries).sort(
            function (a, b) {

                return a.localeCompare(b, "en");

            }
        );


        sortedCountries.forEach(function (country) {

            const option = document.createElement("option");

            option.value = country;
            option.textContent = country;

            countrySelect.appendChild(option);

        });


        /* -----------------------------------------
           Apply filters
        ----------------------------------------- */

        function applyFilters() {

            const searchTerm = normalizeText(searchInput.value);

            const selectedYear = yearSelect.value;

            const selectedCountry = countrySelect.value;

            let visibleCount = 0;


            items.forEach(function (item) {

                const itemText = normalizeText(item.textContent);

                const itemYears = (item.dataset.years || "")
                    .split(/\s+/)
                    .filter(Boolean);

                const itemCountry = item.dataset.country || "";


                const matchesSearch =
                    !searchTerm ||
                    itemText.includes(searchTerm);


                const matchesYear =
                    !selectedYear ||
                    itemYears.includes(selectedYear);


                const matchesCountry =
                    !selectedCountry ||
                    itemCountry === selectedCountry;


                const isVisible =
                    matchesSearch &&
                    matchesYear &&
                    matchesCountry;


                item.hidden = !isVisible;

                item.style.display = isVisible ? "" : "none";


                if (isVisible) {

                    visibleCount++;

                }

            });


            /* -----------------------------------------
               Update result status
            ----------------------------------------- */

            const totalCount = items.length;

            const activeFilters =
                searchTerm !== "" ||
                selectedYear !== "" ||
                selectedCountry !== "";


            if (totalCount === 0) {

                statusElement.textContent = "No entries available.";

            } else if (visibleCount === 0) {

                statusElement.textContent =
                    "No matching " + config.itemPlural + " found.";

            } else if (!activeFilters) {

                statusElement.textContent =
                    totalCount + " " +
                    (totalCount === 1
                        ? config.itemSingular
                        : config.itemPlural);

            } else {

                statusElement.textContent =
                    visibleCount + " of " + totalCount + " " +
                    (totalCount === 1
                        ? config.itemSingular
                        : config.itemPlural);

            }

        }


        /* -----------------------------------------
           Reset filters
        ----------------------------------------- */

        function resetFilters() {

            searchInput.value = "";
            yearSelect.value = "";
            countrySelect.value = "";

            applyFilters();

        }


        /* -----------------------------------------
           Event listeners
        ----------------------------------------- */

        searchInput.addEventListener("input", applyFilters);

        yearSelect.addEventListener("change", applyFilters);

        countrySelect.addEventListener("change", applyFilters);

        resetButton.addEventListener("click", resetFilters);


        /* -----------------------------------------
           Initial filtering
        ----------------------------------------- */

        applyFilters();

    }



    /* =========================================
       Chronological sorting
    ========================================= */

    function sortItemsByDate(containerSelector, itemSelector) {

        const container = document.querySelector(containerSelector);

        if (!container) {
            return;
        }


        const items = Array.from(
            container.querySelectorAll(itemSelector)
        );


        items.sort(function (a, b) {

            const dateA = a.dataset.sortDate || "";
            const dateB = b.dataset.sortDate || "";

            return dateB.localeCompare(dateA);

        });


        items.forEach(function (item) {

            container.appendChild(item);

        });

    }



    /* =========================================
       Initialize Talks
    ========================================= */

    initializeFilters({

        container: ".talks > .talks-list",

        itemSelector: ".talk-item:not(.poster-item)",

        searchId: "talks-search",

        yearId: "talks-filter-year",

        countryId: "talks-filter-country",

        resetId: "talks-filter-reset",

        statusId: "talks-filter-status",

        itemSingular: "talk",

        itemPlural: "talks"

    });



    /* =========================================
       Initialize Posters
    ========================================= */

    // Sort posters chronologically before filtering.

    sortItemsByDate(

        ".talks-posters-list",

        ".poster-item"

    );


    initializeFilters({

        container: ".talks-posters-list",

        itemSelector: ".poster-item",

        searchId: "posters-search",

        yearId: "posters-filter-year",

        countryId: "posters-filter-country",

        resetId: "posters-filter-reset",

        statusId: "posters-filter-status",

        itemSingular: "poster",

        itemPlural: "posters"

    });

});
