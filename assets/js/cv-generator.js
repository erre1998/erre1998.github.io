(() => {
    "use strict";

    const COLORS = {
        navy: "#123348",
        blue: "#19405d",
        teal: "#17525b",
        muted: "#486c78",
        warm: "#bb9e76"
    };

    const PUBLICATION_CATEGORY_ORDER = [
        "Books",
        "Edited Journal Issues",
        "Journal Articles",
        "Book Chapters",
        "Conference Publications",
        "Datasets & Software",
        "Blog Posts",
        "Other Publications"
    ];

    const WEBSITE_TAGS = {
        upcoming: "website:upcoming",
        inPreparation: "website:in-preparation",
        forthcoming: "website:forthcoming",
        editedJournalIssue: "website:edited-journal-issue"
    };

    const normalizeText = value =>
        String(value || "")
            .replace(/\s+/g, " ")
            .trim();

    const text = (root, selector) =>
        normalizeText(
            root?.querySelector(selector)?.textContent
        );

    const absoluteUrl = value => {
        if (!value) {
            return "";
        }

        try {
            return new URL(
                value,
                window.location.href
            ).href;
        }
        catch {
            return value;
        }
    };


    /* =========================================
       Fetch documents
    ========================================== */

    async function fetchDocument(url) {

        const response =
            await fetch(
                absoluteUrl(url),
                {
                    credentials: "same-origin"
                }
            );

        if (!response.ok) {
            throw new Error(
                `Could not load ${url} (${response.status}).`
            );
        }

        return new DOMParser()
            .parseFromString(
                await response.text(),
                "text/html"
            );
    }


    /* =========================================
       Profile
    ========================================== */

    function extractProfile(button) {

        const links =
            Array.from(
                document.querySelectorAll(
                    ".home-profile-link"
                )
            );

        const findLink = label => {

            const node =
                links.find(
                    element =>
                        normalizeText(
                            element.getAttribute(
                                "aria-label"
                            )
                        )
                            .toLowerCase() ===
                        label.toLowerCase()
                );

            return node
                ? absoluteUrl(
                    node.getAttribute("href")
                )
                : "";
        };

        return {
            name:
                button.dataset.name ||
                "Erik Renz",

            photo:
                button.dataset.photo ||
                "",

            address:
                button.dataset.address ||
                "",

            birthDate:
                button.dataset.birthDate ||
                "",

            email:
                findLink("Email")
                    .replace(
                        /^mailto:/i,
                        ""
                    ),

            orcid:
                findLink("ORCID"),

            github:
                findLink("GitHub"),

            fedihum:
                findLink("Fedihum"),

            website:
                window.location.origin
        };
    }


    /* =========================================
       Curriculum Vitae
    ========================================== */

    function extractCvEntry(entry) {

        return {
            date:
                text(
                    entry,
                    ".cv-entry-date"
                ),

            title:
                text(
                    entry,
                    ".cv-entry-title"
                ),

            meta:
                text(
                    entry,
                    ".cv-entry-meta"
                ),

            detail:
                text(
                    entry,
                    ".cv-entry-thesis"
                )
        };
    }


    function extractCv(doc) {

        return Array.from(
            doc.querySelectorAll(
                ".cv > .cv-section"
            )
        )
            .map(section => {

                const blocks = [];

                Array.from(
                    section.children
                )
                    .forEach(child => {

                        if (
                            child.classList
                                .contains(
                                    "cv-entry"
                                )
                        ) {

                            blocks.push({
                                type:
                                    "entry",

                                entry:
                                    extractCvEntry(
                                        child
                                    )
                            });
                        }

                        if (
                            child.classList
                                .contains(
                                    "cv-subsection"
                                )
                        ) {

                            blocks.push({
                                type:
                                    "subsection",

                                title:
                                    text(
                                        child,
                                        ".cv-subsection-title"
                                    ),

                                entries:
                                    Array.from(
                                        child.children
                                    )
                                        .filter(
                                            element =>
                                                element.matches(
                                                    ".cv-entry"
                                                )
                                        )
                                        .map(
                                            extractCvEntry
                                        )
                            });
                        }

                    });

                return {
                    title:
                        text(
                            section,
                            ".cv-section-title"
                        ),

                    blocks
                };
            })
            .filter(
                section =>
                    section.title &&
                    ![
                        "Academic Service",
                        "Professional Memberships & Roles"
                    ]
                        .includes(
                            section.title
                        )
            );
    }


    /* =========================================
       Talks
    ========================================== */

    function extractTalks(doc) {

        return Array.from(
            doc.querySelectorAll(
                ".talk-item"
            )
        )
            .map(item => ({

                date:
                    text(
                        item,
                        ".talk-date"
                    ),

                event:
                    text(
                        item,
                        ".talk-event"
                    ),

                status:
                    text(
                        item,
                        ".talk-status"
                    ),

                title:
                    text(
                        item,
                        ".talk-title"
                    ),

                location:
                    text(
                        item,
                        ".talk-location"
                    ),

                collaborators:
                    normalizeText(
                        text(
                            item,
                            ".talk-collaborators"
                        )
                            .replace(
                                /^With\s+/i,
                                ""
                            )
                    )
            }))
            .filter(
                item =>
                    item.title
            );
    }


    /* =========================================
       Teaching + Theses
    ========================================== */

    function badgeMap(
        root,
        badgeSelector
    ) {

        const result = {};

        Array.from(
            root.querySelectorAll(
                badgeSelector
            )
        )
            .forEach(badge => {

                const label =
                    text(
                        badge,
                        ".teaching-badge-label, .thesis-badge-label"
                    );

                const value =
                    text(
                        badge,
                        ".teaching-badge-value, .thesis-badge-value"
                    );

                if (
                    label &&
                    value
                ) {
                    result[label] =
                        value;
                }
            });

        return result;
    }


    function extractTeaching(doc) {

        return Array.from(
            doc.querySelectorAll(
                ".teaching-course"
            )
        )
            .map(course => ({

                title:
                    text(
                        course,
                        ".teaching-course-title"
                    ),

                meta:
                    badgeMap(
                        course,
                        ".teaching-badge"
                    )
            }))
            .filter(
                course =>
                    course.title
            );
    }


    function extractTheses(doc) {

        return Array.from(
            doc.querySelectorAll(
                ".thesis-entry"
            )
        )
            .map(thesis => ({

                title:
                    text(
                        thesis,
                        ".thesis-title"
                    ),

                meta:
                    badgeMap(
                        thesis,
                        ".thesis-badge"
                    )
            }))
            .filter(
                thesis =>
                    thesis.title
            );
    }


    /* =========================================
       Organized Events
    ========================================== */

    function extractEvents(doc) {

        return Array.from(
            doc.querySelectorAll(
                ".event-item"
            )
        )
            .map(item => {

                const roles =
                    Array.from(
                        item.querySelectorAll(
                            ".event-role"
                        )
                    )
                        .map(role =>
                            [
                                text(
                                    role,
                                    ".event-role-name"
                                ),

                                text(
                                    role,
                                    ".event-role-detail"
                                )
                            ]
                                .filter(Boolean)
                                .join(" ")
                        )
                        .filter(Boolean);

                const editions =
                    Array.from(
                        item.querySelectorAll(
                            ".event-series-edition"
                        )
                    )
                        .map(edition => ({

                            term:
                                text(
                                    edition,
                                    ".event-series-edition-term"
                                ),

                            meta:
                                text(
                                    edition,
                                    ".event-series-edition-meta"
                                )
                        }))
                        .filter(
                            edition =>
                                edition.term
                        );

                return {
                    date:
                        text(
                            item,
                            ".event-item-date"
                        ),

                    type:
                        text(
                            item,
                            ".event-item-type"
                        ),

                    title:
                        text(
                            item,
                            ".event-item-title"
                        ),

                    location:
                        text(
                            item,
                            ".event-item-location"
                        ),

                    roles,
                    editions
                };
            })
            .filter(
                item =>
                    item.title
            );
    }


    /* =========================================
       Academic Service
    ========================================== */

    function extractServices(doc) {

        return Array.from(
            doc.querySelectorAll(
                ".services-section"
            )
        )
            .map(section => ({

                title:
                    text(
                        section,
                        ".services-section-title"
                    ),

                entries:
                    Array.from(
                        section.querySelectorAll(
                            ".service-entry"
                        )
                    )
                        .map(entry => ({

                            date:
                                text(
                                    entry,
                                    ".service-entry-date"
                                ),

                            title:
                                text(
                                    entry,
                                    ".service-entry-title"
                                ),

                            roles:
                                Array.from(
                                    entry.querySelectorAll(
                                        ".service-role"
                                    )
                                )
                                    .map(role =>
                                        [
                                            text(
                                                role,
                                                ".service-role-name"
                                            ),

                                            text(
                                                role,
                                                ".service-role-detail"
                                            )
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")
                                    )
                                    .filter(Boolean),

                            institution:
                                text(
                                    entry,
                                    ".service-entry-institution"
                                )
                        }))
                        .filter(
                            entry =>
                                entry.title
                        )
            }))
            .filter(
                section =>
                    section.title
            );
    }


    /* =========================================
       Projects & Funding
    ========================================== */

    function extractProjects(doc) {

        return Array.from(
            doc.querySelectorAll(
                ".project-item"
            )
        )
            .map(project => {

                const metadata = {};

                Array.from(
                    project.querySelectorAll(
                        ".project-meta-item"
                    )
                )
                    .forEach(item => {

                        const label =
                            text(
                                item,
                                "dt"
                            );

                        const value =
                            text(
                                item,
                                "dd"
                            );

                        if (
                            label &&
                            value
                        ) {
                            metadata[label] =
                                value;
                        }
                    });

                return {
                    period:
                        text(
                            project,
                            ".project-period"
                        ),

                    title:
                        text(
                            project,
                            ".project-title"
                        ),

                    status:
                        text(
                            project,
                            ".project-status"
                        ),

                    metadata
                };
            })
            .filter(
                project =>
                    project.title
            );
    }


    /* =========================================
       Zotero
    ========================================== */

    function yearOf(data) {

        const match =
            String(
                data?.date ||
                ""
            )
                .match(
                    /\b(?:19|20)\d{2}\b/
                );

        return match
            ? Number(
                match[0]
            )
            : 0;
    }


    function creatorName(creator) {

        if (
            creator.name
        ) {
            return creator.name;
        }

        return [
            creator.lastName,
            creator.firstName
        ]
            .filter(Boolean)
            .join(", ");
    }


    function creatorsByType(
        data,
        type
    ) {

        return (
            data.creators ||
            []
        )
            .filter(
                creator =>
                    creator.creatorType ===
                    type
            );
    }


    function joinCreators(
        creators = []
    ) {

        return creators
            .map(
                creatorName
            )
            .filter(Boolean)
            .join("; ");
    }


    function getTags(data) {

        return (
            data.tags ||
            []
        )
            .map(
                tag =>
                    String(
                        tag.tag ||
                        ""
                    )
                        .trim()
                        .toLowerCase()
            );
    }


    function itemKey(item) {

        return (
            item.key ||
            item.data?.key ||
            ""
        );
    }


    async function fetchTaggedItemKeys(
        userId,
        tag
    ) {

        const url =
            new URL(
                `https://api.zotero.org/users/${userId}/publications/items`
            );

        url.searchParams.set(
            "format",
            "keys"
        );

        url.searchParams.set(
            "tag",
            tag
        );

        const response =
            await fetch(
                url.toString(),
                {
                    headers: {
                        "Zotero-API-Version":
                            "3"
                    }
                }
            );

        if (
            !response.ok
        ) {
            return new Set();
        }

        return new Set(
            (
                await response.text()
            )
                .split(/\s+/)
                .map(
                    key =>
                        key.trim()
                )
                .filter(Boolean)
        );
    }


    async function fetchWebsiteTagKeys(
        userId
    ) {

        const names =
            Object.keys(
                WEBSITE_TAGS
            );

        const pairs =
            await Promise.all(
                names.map(
                    async name => [
                        name,

                        await fetchTaggedItemKeys(
                            userId,
                            WEBSITE_TAGS[name]
                        )
                    ]
                )
            );

        return Object.fromEntries(
            pairs
        );
    }


    function hasWebsiteTag(
        item,
        tagName,
        tagKeys
    ) {

        if (
            getTags(
                item.data
            )
                .includes(
                    WEBSITE_TAGS[
                        tagName
                    ]
                )
        ) {
            return true;
        }

        const key =
            itemKey(
                item
            );

        return Boolean(
            key &&
            tagKeys[
                tagName
            ]?.has(key)
        );
    }


    function publicationStatus(
        item,
        tagKeys
    ) {

        if (
            hasWebsiteTag(
                item,
                "inPreparation",
                tagKeys
            )
        ) {
            return "In preparation";
        }

        if (
            hasWebsiteTag(
                item,
                "upcoming",
                tagKeys
            )
        ) {
            return "Upcoming";
        }

        if (
            hasWebsiteTag(
                item,
                "forthcoming",
                tagKeys
            )
        ) {
            return "Forthcoming";
        }

        return "";
    }


    function publicationCategory(
        item,
        tagKeys
    ) {

        const type =
            item.data?.itemType;

        if (
            hasWebsiteTag(
                item,
                "editedJournalIssue",
                tagKeys
            )
        ) {
            return "Edited Journal Issues";
        }

        if (
            type ===
            "book"
        ) {
            return "Books";
        }

        if (
            type ===
            "journalArticle"
        ) {
            return "Journal Articles";
        }

        if (
            [
                "bookSection",
                "encyclopediaArticle"
            ]
                .includes(
                    type
                )
        ) {
            return "Book Chapters";
        }

        if (
            type ===
            "conferencePaper"
        ) {
            return "Conference Publications";
        }

        if (
            [
                "dataset",
                "computerProgram",
                "software"
            ]
                .includes(
                    type
                )
        ) {
            return "Datasets & Software";
        }

        if (
            [
                "blogPost",
                "webpage"
            ]
                .includes(
                    type
                )
        ) {
            return "Blog Posts";
        }

        return "Other Publications";
    }


    async function fetchPublications(
        userId
    ) {

        if (
            !userId
        ) {
            return [];
        }

        const items = [];
        const limit = 100;

        let start = 0;

        while (
            true
        ) {

            const url =
                new URL(
                    `https://api.zotero.org/users/${userId}/publications/items`
                );

            url.searchParams.set(
                "format",
                "json"
            );

            url.searchParams.set(
                "sort",
                "date"
            );

            url.searchParams.set(
                "direction",
                "desc"
            );

            url.searchParams.set(
                "limit",
                String(
                    limit
                )
            );

            url.searchParams.set(
                "start",
                String(
                    start
                )
            );

            const response =
                await fetch(
                    url.toString(),
                    {
                        headers: {
                            "Zotero-API-Version":
                                "3"
                        }
                    }
                );

            if (
                !response.ok
            ) {
                throw new Error(
                    `Zotero API returned ${response.status}.`
                );
            }

            const batch =
                await response.json();

            items.push(
                ...batch
            );

            if (
                batch.length <
                limit
            ) {
                break;
            }

            start +=
                limit;
        }

        const clean =
            items.filter(
                item => {

                    const type =
                        item?.data
                            ?.itemType;

                    return (
                        item?.data &&
                        ![
                            "attachment",
                            "note",
                            "annotation"
                        ]
                            .includes(
                                type
                            )
                    );
                }
            );

        const tagKeys =
            await fetchWebsiteTagKeys(
                userId
            );

        return clean.map(
            item => ({
                item,

                category:
                    publicationCategory(
                        item,
                        tagKeys
                    ),

                status:
                    publicationStatus(
                        item,
                        tagKeys
                    )
            })
        );
    }


    function publicationLink(data) {

        if (
            data.DOI
        ) {

            return `https://doi.org/${
                String(
                    data.DOI
                )
                    .replace(
                        /^https?:\/\/doi\.org\//i,
                        ""
                    )
            }`;
        }

        if (
            data.url &&
            /^https?:\/\//i
                .test(
                    data.url
                )
        ) {
            return data.url;
        }

        return "";
    }


    function bibliographyText(record) {

        const data =
            record.item.data;

        const authors =
            joinCreators(
                creatorsByType(
                    data,
                    "author"
                )
            );

        const editorsArray =
            creatorsByType(
                data,
                "editor"
            );

        const editors =
            joinCreators(
                editorsArray
            );

        const creatorText =
            authors ||
            (
                editors
                    ? `${editors} (ed${editorsArray.length > 1 ? "s" : ""}.)`
                    : ""
            );

        const year =
            yearOf(
                data
            );

        const yearText =
            year
                ? String(
                    year
                )
                : record.status ||
                    "n.d.";

        const title =
            normalizeText(
                data.title ||
                "(Untitled)"
            );

        const parts = [];

        if (
            creatorText
        ) {
            parts.push(
                `${creatorText}.`
            );
        }

        parts.push(
            `${yearText}.`
        );

        if (
            data.itemType ===
            "journalArticle"
        ) {

            parts.push(
                `“${title}.”`
            );

            let venue =
                normalizeText(
                    data.publicationTitle
                );

            if (
                data.volume
            ) {
                venue +=
                    `${venue ? " " : ""}${data.volume}`;
            }

            if (
                data.issue
            ) {
                venue +=
                    `(${data.issue})`;
            }

            if (
                data.pages
            ) {
                venue +=
                    `${venue ? ": " : ""}${data.pages}`;
            }

            if (
                venue
            ) {
                parts.push(
                    `${venue}.`
                );
            }
        }
        else if (
            [
                "bookSection",
                "encyclopediaArticle"
            ]
                .includes(
                    data.itemType
                )
        ) {

            parts.push(
                `“${title}.”`
            );

            if (
                data.bookTitle
            ) {

                let sentence =
                    `In ${data.bookTitle}`;

                if (
                    editors
                ) {
                    sentence +=
                        `, edited by ${editors}`;
                }

                if (
                    data.pages
                ) {
                    sentence +=
                        `, ${data.pages}`;
                }

                parts.push(
                    `${sentence}.`
                );
            }
        }
        else if (
            data.itemType ===
            "conferencePaper"
        ) {

            parts.push(
                `“${title}.”`
            );

            const proceedings =
                normalizeText(
                    data.proceedingsTitle ||
                    data.conferenceName
                );

            if (
                proceedings
            ) {
                parts.push(
                    `In ${proceedings}.`
                );
            }
        }
        else {

            parts.push(
                `${title}.`
            );
        }

        const imprint =
            [
                data.place,
                data.publisher
            ]
                .filter(Boolean)
                .join(": ");

        if (
            imprint
        ) {
            parts.push(
                `${imprint}.`
            );
        }

        if (
            record.status &&
            year
        ) {
            parts.push(
                `[${record.status}]`
            );
        }

        return {
            text:
                normalizeText(
                    parts.join(" ")
                ),

            link:
                publicationLink(
                    data
                ),

            year
        };
    }


    function groupPublications(
        records
    ) {

        const groups = {};

        records.forEach(
            record => {

                if (
                    !groups[
                        record.category
                    ]
                ) {
                    groups[
                        record.category
                    ] = [];
                }

                groups[
                    record.category
                ]
                    .push(
                        record
                    );
            }
        );

        Object.values(
            groups
        )
            .forEach(
                group => {

                    group.sort(
                        (a, b) => {

                            const yearDiff =
                                yearOf(
                                    b.item.data
                                ) -
                                yearOf(
                                    a.item.data
                                );

                            if (
                                yearDiff
                            ) {
                                return yearDiff;
                            }

                            return String(
                                a.item.data.title ||
                                ""
                            )
                                .localeCompare(
                                    String(
                                        b.item.data.title ||
                                        ""
                                    ),
                                    "en"
                                );
                        }
                    );
                }
            );

        return PUBLICATION_CATEGORY_ORDER
            .filter(
                category =>
                    groups[
                        category
                    ]?.length
            )
            .map(
                category => ({
                    title:
                        category,

                    items:
                        groups[
                            category
                        ]
                })
            );
    }


    /* =========================================
       Portrait
    ========================================== */

    async function circularImageDataUrl(
        imageUrl,
        size = 320
    ) {

        const response =
            await fetch(
                absoluteUrl(
                    imageUrl
                )
            );

        if (
            !response.ok
        ) {
            throw new Error(
                "Could not load portrait."
            );
        }

        const bitmap =
            await createImageBitmap(
                await response.blob()
            );

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            size;

        canvas.height =
            size;

        const context =
            canvas.getContext(
                "2d"
            );

        context.save();

        context.beginPath();

        context.arc(
            size / 2,
            size / 2,
            size / 2,
            0,
            Math.PI * 2
        );

        context.clip();

        const scale =
            Math.max(
                size /
                bitmap.width,

                size /
                bitmap.height
            );

        const width =
            bitmap.width *
            scale;

        const height =
            bitmap.height *
            scale;

        const x =
            (
                size -
                width
            ) / 2;

        const y =
            (
                size -
                height
            ) * 0.32;

        context.drawImage(
            bitmap,
            x,
            y,
            width,
            height
        );

        context.restore();

        return canvas.toDataURL(
            "image/png"
        );
    }


    /* =========================================
       PDF layout
    ========================================== */

    function sectionHeading(title) {

        return {
            margin:
                [0, 18, 0, 8],

            columns: [
                {
                    width:
                        5,

                    canvas: [
                        {
                            type:
                                "rect",

                            x:
                                0,

                            y:
                                0,

                            w:
                                5,

                            h:
                                18,

                            color:
                                COLORS.teal
                        }
                    ]
                },

                {
                    width:
                        "*",

                    text:
                        title,

                    style:
                        "sectionTitle",

                    margin:
                        [8, 0, 0, 0]
                }
            ]
        };
    }


    function subsectionHeading(title) {

        return {
            text:
                title,

            style:
                "subsectionTitle",

            margin:
                [0, 10, 0, 5]
        };
    }


    /*
     * Each individual entry is kept together.
     *
     * This means a page break may occur
     * before or after the entry, but never
     * inside it.
     */

    function timelineEntry(
        date,
        title,
        details = [],
        options = {}
    ) {

        return {
            unbreakable:
                options.unbreakable !== false,

            margin:
                [0, 0, 0, 7],

            columns: [
                {
                    width:
                        78,

                    text:
                        date ||
                        "",

                    style:
                        "date"
                },

                {
                    width:
                        "*",

                    stack: [
                        {
                            text:
                                title ||
                                "",

                            style:
                                "entryTitle",

                            margin:
                                [0, 0, 0, 0]
                        },

                        ...details
                            .filter(Boolean)
                            .map(
                                detail => ({
                                    text:
                                        detail,

                                    style:
                                        "entryMeta",

                                    margin:
                                        [0, 2, 0, 0]
                                })
                            )
                    ]
                }
            ],

            columnGap:
                10
        };
    }


    /*
     * Used when an entry is already part of
     * a larger protected block.
     *
     * This avoids unnecessary nested
     * unbreakable calculations.
     */

    function withoutOwnUnbreakable(node) {

        return {
            ...node,
            unbreakable:
                false
        };
    }


    /*
     * Keeps:
     *
     * Section heading
     * +
     * first entry
     *
     * together on one page.
     *
     * All following entries can move
     * independently to the next page.
     */

    function pushSection(
        content,
        title,
        nodes
    ) {

        if (
            !nodes?.length
        ) {
            return;
        }

        content.push({
            unbreakable:
                true,

            stack: [
                sectionHeading(
                    title
                ),

                withoutOwnUnbreakable(
                    nodes[0]
                )
            ]
        });

        if (
            nodes.length >
            1
        ) {
            content.push(
                ...nodes.slice(
                    1
                )
            );
        }
    }


    /*
     * Keeps:
     *
     * Subsection heading
     * +
     * first entry
     *
     * together.
     */

    function subsectionNodes(
        title,
        entries
    ) {

        if (
            !entries?.length
        ) {
            return [];
        }

        return [
            {
                unbreakable:
                    true,

                stack: [
                    subsectionHeading(
                        title
                    ),

                    withoutOwnUnbreakable(
                        entries[0]
                    )
                ]
            },

            ...entries.slice(
                1
            )
        ];
    }


    function teachingMeta(meta) {

        return [
            meta.Location,
            meta.Type,

            meta.SWS
                ? `${meta.SWS} SWS`
                : "",

            meta.Language
        ]
            .filter(Boolean)
            .join(" · ");
    }


    function thesisMeta(meta) {

        const lines = [];

        const overview =
            [
                meta.Type,
                meta.Location,
                meta.Role,
                meta.Language
            ]
                .filter(Boolean)
                .join(" · ");

        if (
            overview
        ) {
            lines.push(
                overview
            );
        }

        if (
            meta[
                "First Supervisor"
            ]
        ) {
            lines.push(
                `First Supervisor: ${meta["First Supervisor"]}`
            );
        }

        if (
            meta[
                "Second Supervisor"
            ]
        ) {
            lines.push(
                `Second Supervisor: ${meta["Second Supervisor"]}`
            );
        }

        return lines;
    }


    function projectMeta(meta) {

        return [
            "Duration",
            "Funding",
            "Applicants",
            "Coordination",
            "Funder"
        ]
            .filter(
                key =>
                    meta[key]
            )
            .map(
                key =>
                    `${key}: ${meta[key]}`
            );
    }


    /*
     * Each edition of a recurring event
     * is one protected unit.
     */

    function editionNode(edition) {

        return {
            unbreakable:
                true,

            margin:
                [88, -3, 0, 5],

            text: [
                {
                    text:
                        edition.term,

                    bold:
                        true,

                    color:
                        COLORS.teal
                },

                edition.meta
                    ? ` · ${edition.meta}`
                    : ""
            ],

            style:
                "entryMeta"
        };
    }


    /* =========================================
       PDF document
    ========================================== */

    function buildDocumentDefinition(
        model,
        portrait
    ) {

        const content = [];


        /* ---------------------------------
           Header
        ---------------------------------- */

        content.push({
            margin:
                [0, 0, 0, 18],

            table: {
                widths:
                    [90, "*"],

                body: [[
                    {
                        border:
                            [
                                false,
                                false,
                                false,
                                false
                            ],

                        image:
                            portrait,

                        width:
                            78,

                        height:
                            78,

                        alignment:
                            "center",

                        margin:
                            [0, 0, 8, 0]
                    },

                    {
                        border:
                            [
                                false,
                                false,
                                false,
                                false
                            ],

                        stack: [
                            {
                                text:
                                    model.profile.name,

                                style:
                                    "name"
                            },

                            {
                                text: [
                                    model.profile.address,

                                    (
                                        model.profile.address &&
                                        model.profile.birthDate
                                    )
                                        ? "  ·  "
                                        : "",

                                    model.profile.birthDate
                                ],

                                style:
                                    "institution",

                                margin:
                                    [0, 4, 0, 7]
                            },

                            {
                                text: [
                                    model.profile.email
                                        ? {
                                            text:
                                                model.profile.email,

                                            link:
                                                `mailto:${model.profile.email}`
                                        }
                                        : {},

                                    (
                                        model.profile.email &&
                                        model.profile.website
                                    )
                                        ? "  ·  "
                                        : "",

                                    model.profile.website
                                        ? {
                                            text:
                                                "Website",

                                            link:
                                                model.profile.website
                                        }
                                        : {},

                                    model.profile.orcid
                                        ? "  ·  "
                                        : "",

                                    model.profile.orcid
                                        ? {
                                            text:
                                                "ORCID",

                                            link:
                                                model.profile.orcid
                                        }
                                        : {},

                                    model.profile.github
                                        ? "  ·  "
                                        : "",

                                    model.profile.github
                                        ? {
                                            text:
                                                "GitHub",

                                            link:
                                                model.profile.github
                                        }
                                        : {},

                                    model.profile.fedihum
                                        ? "  ·  "
                                        : "",

                                    model.profile.fedihum
                                        ? {
                                            text:
                                                "Fedihum",

                                            link:
                                                model.profile.fedihum
                                        }
                                        : {}
                                ],

                                style:
                                    "contact"
                            }
                        ]
                    }
                ]]
            },

            layout: {
                hLineWidth:
                    () => 0,

                vLineWidth:
                    () => 0,

                paddingLeft:
                    () => 0,

                paddingRight:
                    () => 0,

                paddingTop:
                    () => 0,

                paddingBottom:
                    () => 0
            }
        });


        content.push({
            canvas: [
                {
                    type:
                        "line",

                    x1:
                        0,

                    y1:
                        0,

                    x2:
                        515,

                    y2:
                        0,

                    lineWidth:
                        1.2,

                    lineColor:
                        COLORS.warm
                }
            ],

            margin:
                [0, 0, 0, 6]
        });


        /* ---------------------------------
           Existing CV
        ---------------------------------- */

        model.cv
            .forEach(section => {

                const nodes = [];

                section.blocks
                    .forEach(block => {

                        if (
                            block.type ===
                            "entry"
                        ) {

                            nodes.push(
                                timelineEntry(
                                    block.entry.date,
                                    block.entry.title,
                                    [
                                        block.entry.meta,
                                        block.entry.detail
                                    ]
                                )
                            );
                        }

                        if (
                            block.type ===
                            "subsection"
                        ) {

                            const entries =
                                block.entries
                                    .map(
                                        entry =>
                                            timelineEntry(
                                                entry.date,
                                                entry.title,
                                                [
                                                    entry.meta,
                                                    entry.detail
                                                ]
                                            )
                                    );

                            nodes.push(
                                ...subsectionNodes(
                                    block.title,
                                    entries
                                )
                            );
                        }
                    });

                pushSection(
                    content,
                    section.title,
                    nodes
                );
            });


        /* ---------------------------------
           Publications
        ---------------------------------- */

        const publicationNodes = [];

        model.publications
            .forEach(group => {

                const entries =
                    group.items
                        .map(record => {

                            const bibliography =
                                bibliographyText(
                                    record
                                );

                            return {
                                unbreakable:
                                    true,

                                margin:
                                    [0, 0, 0, 6],

                                text: {
                                    text:
                                        bibliography.text,

                                    link:
                                        bibliography.link ||
                                        undefined
                                },

                                style:
                                    "bibliography"
                            };
                        });

                publicationNodes.push(
                    ...subsectionNodes(
                        group.title,
                        entries
                    )
                );
            });

        pushSection(
            content,
            "Publications",
            publicationNodes
        );


        /* ---------------------------------
           Talks
        ---------------------------------- */

        const talkNodes =
            model.talks
                .map(talk =>
                    timelineEntry(
                        talk.date,
                        talk.title,
                        [
                            talk.event,
                            talk.location,

                            talk.collaborators
                                ? `With: ${talk.collaborators}`
                                : "",

                            talk.status
                                ? `Status: ${talk.status}`
                                : ""
                        ]
                    )
                );

        pushSection(
            content,
            "Talks",
            talkNodes
        );


        /* ---------------------------------
           Teaching
        ---------------------------------- */

        const teachingNodes =
            model.teaching
                .map(course =>
                    timelineEntry(
                        course.meta.Term,
                        course.title,
                        [
                            teachingMeta(
                                course.meta
                            )
                        ]
                    )
                );

        pushSection(
            content,
            "Teaching",
            teachingNodes
        );


        /* ---------------------------------
           Thesis Supervisions
        ---------------------------------- */

        const thesisNodes =
            model.theses
                .map(thesis =>
                    timelineEntry(
                        thesis.meta.Term,
                        thesis.title,
                        thesisMeta(
                            thesis.meta
                        )
                    )
                );

        pushSection(
            content,
            "Thesis Supervisions",
            thesisNodes
        );


        /* ---------------------------------
           Organized Events
        ---------------------------------- */

        const eventNodes = [];

        model.events
            .forEach(event => {

                const main =
                    timelineEntry(
                        event.date,
                        event.title,
                        [
                            [
                                event.type,
                                event.location
                            ]
                                .filter(Boolean)
                                .join(" · "),

                            ...event.roles
                        ]
                    );

                const editions =
                    (
                        event.editions ||
                        []
                    )
                        .map(
                            editionNode
                        );

                /*
                 * For recurring series:
                 *
                 * Main event + first edition stay
                 * together.
                 *
                 * Following editions may move
                 * independently to another page,
                 * but each edition remains intact.
                 */

                if (
                    editions.length
                ) {

                    eventNodes.push({
                        unbreakable:
                            true,

                        stack: [
                            withoutOwnUnbreakable(
                                main
                            ),

                            withoutOwnUnbreakable(
                                editions[0]
                            )
                        ]
                    });

                    eventNodes.push(
                        ...editions.slice(
                            1
                        )
                    );
                }
                else {

                    eventNodes.push(
                        main
                    );
                }
            });

        pushSection(
            content,
            "Organized Events",
            eventNodes
        );


        /* ---------------------------------
           Academic Service
        ---------------------------------- */

        const serviceNodes = [];

        model.services
            .forEach(section => {

                const entries =
                    section.entries
                        .map(entry =>
                            timelineEntry(
                                entry.date,
                                entry.title,
                                [
                                    ...entry.roles,
                                    entry.institution
                                ]
                            )
                        );

                serviceNodes.push(
                    ...subsectionNodes(
                        section.title,
                        entries
                    )
                );
            });

        pushSection(
            content,
            "Academic Service",
            serviceNodes
        );


        /* ---------------------------------
           Projects & Funding
        ---------------------------------- */

        const projectNodes =
            model.projects
                .map(project => {

                    const lines =
                        projectMeta(
                            project.metadata
                        );

                    if (
                        project.status
                    ) {
                        lines.unshift(
                            `Status: ${normalizeText(project.status)}`
                        );
                    }

                    return timelineEntry(
                        project.period,
                        project.title,
                        lines
                    );
                });

        pushSection(
            content,
            "Projects & Funding",
            projectNodes
        );


        /* =========================================
           Final PDF definition
        ========================================== */

        return {
            pageSize:
                "A4",

            pageMargins:
                [42, 46, 42, 48],

            info: {
                title:
                    `${model.profile.name} - Curriculum Vitae`,

                author:
                    model.profile.name,

                subject:
                    "Academic Curriculum Vitae"
            },

            defaultStyle: {
                font:
                    "Roboto",

                fontSize:
                    9.2,

                color:
                    COLORS.navy,

                lineHeight:
                    1.22
            },

            styles: {

                name: {
                    fontSize:
                        23,

                    bold:
                        true,

                    color:
                        COLORS.navy,

                    lineHeight:
                        1.05
                },

                institution: {
                    fontSize:
                        9.5,

                    color:
                        COLORS.muted
                },

                contact: {
                    fontSize:
                        8.3,

                    color:
                        COLORS.blue
                },

                sectionTitle: {
                    fontSize:
                        14,

                    bold:
                        true,

                    color:
                        COLORS.navy,

                    lineHeight:
                        1.1
                },

                subsectionTitle: {
                    fontSize:
                        9,

                    bold:
                        true,

                    color:
                        COLORS.teal,

                    characterSpacing:
                        0.65
                },

                date: {
                    fontSize:
                        8.2,

                    bold:
                        true,

                    color:
                        COLORS.blue,

                    lineHeight:
                        1.25
                },

                entryTitle: {
                    fontSize:
                        9.4,

                    bold:
                        true,

                    color:
                        COLORS.navy,

                    lineHeight:
                        1.25
                },

                entryMeta: {
                    fontSize:
                        8.5,

                    color:
                        COLORS.muted,

                    lineHeight:
                        1.25
                },

                bibliography: {
                    fontSize:
                        8.55,

                    color:
                        COLORS.navy,

                    lineHeight:
                        1.27
                }
            },

            footer:
                (
                    currentPage,
                    pageCount
                ) => ({

                    margin:
                        [42, 12, 42, 0],

                    columns: [
                        {
                            text:
                                `${model.profile.name} · Curriculum Vitae`,

                            color:
                                COLORS.muted,

                            fontSize:
                                7.4
                        },

                        {
                            text:
                                `Page ${currentPage} of ${pageCount}`,

                            alignment:
                                "right",

                            color:
                                COLORS.muted,

                            fontSize:
                                7.4
                        }
                    ]
                }),

            content
        };
    }


    /* =========================================
       Load all data
    ========================================== */

    async function loadModel(button) {

        const [
            cvDocument,
            talksDocument,
            teachingDocument,
            eventsDocument,
            servicesDocument,
            projectsDocument,
            publicationRecords
        ] =
            await Promise.all([

                fetchDocument(
                    button.dataset.cvUrl
                ),

                fetchDocument(
                    button.dataset.talksUrl
                ),

                fetchDocument(
                    button.dataset.teachingUrl
                ),

                fetchDocument(
                    button.dataset.eventsUrl
                ),

                fetchDocument(
                    button.dataset.servicesUrl
                ),

                fetchDocument(
                    button.dataset.projectsUrl
                ),

                fetchPublications(
                    button.dataset.zoteroUserId
                )
            ]);

        return {
            profile:
                extractProfile(
                    button
                ),

            cv:
                extractCv(
                    cvDocument
                ),

            publications:
                groupPublications(
                    publicationRecords
                ),

            talks:
                extractTalks(
                    talksDocument
                ),

            teaching:
                extractTeaching(
                    teachingDocument
                ),

            theses:
                extractTheses(
                    teachingDocument
                ),

            events:
                extractEvents(
                    eventsDocument
                ),

            services:
                extractServices(
                    servicesDocument
                ),

            projects:
                extractProjects(
                    projectsDocument
                )
        };
    }


    /* =========================================
       Generate PDF
    ========================================== */

    async function generatePdf(
        button,
        status
    ) {

        if (
            !window.pdfMake
        ) {
            throw new Error(
                "pdfmake is not available. Add the local pdfmake vendor files first."
            );
        }

        status.textContent =
            "Collecting current website data…";

        const model =
            await loadModel(
                button
            );

        status.textContent =
            "Preparing portrait…";

        const portrait =
            await circularImageDataUrl(
                model.profile.photo
            );

        status.textContent =
            "Generating PDF…";

        const definition =
            buildDocumentDefinition(
                model,
                portrait
            );

        const filename =
            `${model.profile.name
                .replace(
                    /\s+/g,
                    "_"
                )}_CV.pdf`;

        window.pdfMake
            .createPdf(
                definition
            )
            .download(
                filename,
                () => {

                    status.textContent =
                        "CV generated.";

                    setTimeout(
                        () => {
                            status.textContent =
                                "";
                        },
                        3500
                    );

                    button.disabled =
                        false;
                }
            );
    }


    /* =========================================
       Initialise
    ========================================== */

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            const button =
                document.getElementById(
                    "generate-cv-button"
                );

            const status =
                document.getElementById(
                    "generate-cv-status"
                );

            if (
                !button ||
                !status
            ) {
                return;
            }

            button.addEventListener(
                "click",
                async () => {

                    button.disabled =
                        true;

                    try {

                        await generatePdf(
                            button,
                            status
                        );
                    }
                    catch (error) {

                        console.error(
                            "CV generation failed:",
                            error
                        );

                        status.textContent =
                            "The CV could not be generated.";

                        button.disabled =
                            false;
                    }
                }
            );
        }
    );
})();