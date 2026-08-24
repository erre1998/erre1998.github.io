(() => {
    "use strict";

    const COLORS = {
        navy: "#123348",
        blue: "#19405d",
        teal: "#17525b",
        muted: "#486c78",
        warm: "#bb9e76",
        pale: "#edf3f3",
        line: "#d7e0e3",
        white: "#ffffff"
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

    const directChildren = (element, selector) =>
        Array.from(element?.children || [])
            .filter(child =>
                child.matches(selector)
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

        const html =
            await response.text();

        return new DOMParser()
            .parseFromString(
                html,
                "text/html"
            );
    }

    function extractProfile(button) {
        const profileLinks =
            Array.from(
                document.querySelectorAll(
                    ".home-profile-link"
                )
            );

        const findLink = label => {
            const link =
                profileLinks.find(
                    element =>
                        normalizeText(
                            element.getAttribute(
                                "aria-label"
                            )
                        ).toLowerCase() ===
                        label.toLowerCase()
                );

            return link
                ? absoluteUrl(
                    link.getAttribute("href")
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

            position:
                text(
                    document,
                    ".home-position-link"
                ),

            institution:
                text(
                    document,
                    ".home-position-institution"
                ),

            email:
                findLink("Email")
                    .replace(/^mailto:/i, ""),

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

    function extractCv(documentNode) {
        return Array.from(
            documentNode.querySelectorAll(
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
                                .contains("cv-entry")
                        ) {
                            blocks.push({
                                type: "entry",

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
                                    directChildren(
                                        child,
                                        ".cv-entry"
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
                    section.title
            );
    }

    function extractTalks(documentNode) {
        return Array.from(
            documentNode.querySelectorAll(
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

    function badgeMap(root, badgeSelector) {
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
                    result[label] = value;
                }
            });

        return result;
    }

    function extractTeaching(documentNode) {
        return Array.from(
            documentNode.querySelectorAll(
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

    function extractTheses(documentNode) {
        return Array.from(
            documentNode.querySelectorAll(
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

    function extractEvents(documentNode) {
        return Array.from(
            documentNode.querySelectorAll(
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
                        .map(role => {
                            const name =
                                text(
                                    role,
                                    ".event-role-name"
                                );

                            const detail =
                                text(
                                    role,
                                    ".event-role-detail"
                                );

                            return normalizeText(
                                [name, detail]
                                    .filter(Boolean)
                                    .join(" ")
                            );
                        })
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

                    description:
                        text(
                            item,
                            ".event-item-description"
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

    function extractServices(documentNode) {
        return Array.from(
            documentNode.querySelectorAll(
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

                            detail:
                                text(
                                    entry,
                                    ".service-entry-detail"
                                ),

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

    function extractProjects(documentNode) {
        return Array.from(
            documentNode.querySelectorAll(
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

    function yearOf(data) {
        const match =
            String(
                data?.date || ""
            )
                .match(
                    /\b(?:19|20)\d{2}\b/
                );

        return match
            ? Number(match[0])
            : 0;
    }

    function creatorName(creator) {
        if (creator.name) {
            return creator.name;
        }

        const last =
            creator.lastName || "";

        const first =
            creator.firstName || "";

        return [
            last,
            first
        ]
            .filter(Boolean)
            .join(", ");
    }

    function creatorsByType(
        data,
        creatorType
    ) {
        return (
            data.creators || []
        )
            .filter(
                creator =>
                    creator.creatorType ===
                    creatorType
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
            data.tags || []
        )
            .map(
                tag =>
                    String(
                        tag.tag || ""
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

        if (!response.ok) {
            return new Set();
        }

        const raw =
            await response.text();

        return new Set(
            raw
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

        const results =
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
            results
        );
    }

    function hasWebsiteTag(
        item,
        tagName,
        websiteTagKeys
    ) {
        const directTags =
            getTags(item.data);

        if (
            directTags.includes(
                WEBSITE_TAGS[tagName]
            )
        ) {
            return true;
        }

        const key =
            itemKey(item);

        return Boolean(
            key &&
            websiteTagKeys[tagName]
                ?.has(key)
        );
    }

    function publicationStatus(
        item,
        websiteTagKeys
    ) {
        if (
            hasWebsiteTag(
                item,
                "inPreparation",
                websiteTagKeys
            )
        ) {
            return "In preparation";
        }

        if (
            hasWebsiteTag(
                item,
                "upcoming",
                websiteTagKeys
            )
        ) {
            return "Upcoming";
        }

        if (
            hasWebsiteTag(
                item,
                "forthcoming",
                websiteTagKeys
            )
        ) {
            return "Forthcoming";
        }

        return "";
    }

    function detectPublicationCategory(
        item,
        websiteTagKeys
    ) {
        const type =
            item.data?.itemType;

        if (
            hasWebsiteTag(
                item,
                "editedJournalIssue",
                websiteTagKeys
            )
        ) {
            return "Edited Journal Issues";
        }

        if (type === "book") {
            return "Books";
        }

        if (type === "journalArticle") {
            return "Journal Articles";
        }

        if (
            type === "bookSection" ||
            type === "encyclopediaArticle"
        ) {
            return "Book Chapters";
        }

        if (type === "conferencePaper") {
            return "Conference Publications";
        }

        if (
            type === "dataset" ||
            type === "computerProgram" ||
            type === "software"
        ) {
            return "Datasets & Software";
        }

        if (
            type === "blogPost" ||
            type === "webpage"
        ) {
            return "Blog Posts";
        }

        return "Other Publications";
    }

    async function fetchPublications(
        userId
    ) {
        if (!userId) {
            return [];
        }

        const items = [];

        const limit = 100;

        let start = 0;

        while (true) {
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
                String(limit)
            );

            url.searchParams.set(
                "start",
                String(start)
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

            if (!response.ok) {
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
                batch.length < limit
            ) {
                break;
            }

            start += limit;
        }

        const clean =
            items.filter(item => {
                const type =
                    item?.data?.itemType;

                return (
                    item?.data &&
                    type !== "attachment" &&
                    type !== "note" &&
                    type !== "annotation"
                );
            });

        const websiteTagKeys =
            await fetchWebsiteTagKeys(
                userId
            );

        return clean.map(
            item => ({
                item,

                category:
                    detectPublicationCategory(
                        item,
                        websiteTagKeys
                    ),

                status:
                    publicationStatus(
                        item,
                        websiteTagKeys
                    )
            })
        );
    }

    function publicationLink(data) {
        if (data.DOI) {
            return `https://doi.org/${data.DOI}`;
        }

        if (
            data.url &&
            /^https?:\/\//i.test(
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

        const editors =
            joinCreators(
                creatorsByType(
                    data,
                    "editor"
                )
            );

        const creatorText =
            authors ||
            (
                editors
                    ? `${editors} (ed${creatorsByType(data, "editor").length > 1 ? "s" : ""}.)`
                    : ""
            );

        const year =
            yearOf(data);

        const yearText =
            year
                ? String(year)
                : record.status || "n.d.";

        const title =
            normalizeText(
                data.title ||
                "(Untitled)"
            );

        const type =
            data.itemType;

        const parts = [];

        if (creatorText) {
            parts.push(
                `${creatorText}.`
            );
        }

        parts.push(
            `${yearText}.`
        );

        if (
            type === "journalArticle"
        ) {
            parts.push(
                `“${title}.”`
            );

            const journal =
                normalizeText(
                    data.publicationTitle
                );

            let venue =
                journal;

            if (data.volume) {
                venue +=
                    `${venue ? " " : ""}${data.volume}`;
            }

            if (data.issue) {
                venue +=
                    `(${data.issue})`;
            }

            if (data.pages) {
                venue +=
                    `${venue ? ": " : ""}${data.pages}`;
            }

            if (venue) {
                parts.push(
                    `${venue}.`
                );
            }
        }

        else if (
            type === "bookSection" ||
            type === "encyclopediaArticle"
        ) {
            parts.push(
                `“${title}.”`
            );

            let container =
                normalizeText(
                    data.bookTitle
                );

            if (container) {
                let sentence =
                    `In ${container}`;

                if (editors) {
                    sentence +=
                        `, edited by ${editors}`;
                }

                if (data.pages) {
                    sentence +=
                        `, ${data.pages}`;
                }

                sentence += ".";

                parts.push(
                    sentence
                );
            }

            const imprint =
                [
                    data.place,
                    data.publisher
                ]
                    .filter(Boolean)
                    .join(": ");

            if (imprint) {
                parts.push(
                    `${imprint}.`
                );
            }
        }

        else if (
            type === "conferencePaper"
        ) {
            parts.push(
                `“${title}.”`
            );

            const proceedings =
                normalizeText(
                    data.proceedingsTitle ||
                    data.conferenceName
                );

            if (proceedings) {
                parts.push(
                    `In ${proceedings}.`
                );
            }

            const imprint =
                [
                    data.place,
                    data.publisher
                ]
                    .filter(Boolean)
                    .join(": ");

            if (imprint) {
                parts.push(
                    `${imprint}.`
                );
            }
        }

        else {
            parts.push(
                `${title}.`
            );

            const venue =
                normalizeText(
                    data.publicationTitle ||
                    data.websiteTitle ||
                    data.repository
                );

            if (venue) {
                parts.push(
                    `${venue}.`
                );
            }

            const imprint =
                [
                    data.place,
                    data.publisher
                ]
                    .filter(Boolean)
                    .join(": ");

            if (imprint) {
                parts.push(
                    `${imprint}.`
                );
            }
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
                publicationLink(data),

            year
        };
    }

    function groupPublications(
        records
    ) {
        const groups = {};

        records.forEach(record => {
            const category =
                record.category;

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category]
                .push(record);
        });

        Object.values(groups)
            .forEach(group => {
                group.sort(
                    (a, b) => {
                        const yearDiff =
                            yearOf(
                                b.item.data
                            ) -
                            yearOf(
                                a.item.data
                            );

                        if (yearDiff) {
                            return yearDiff;
                        }

                        return String(
                            a.item.data.title || ""
                        )
                            .localeCompare(
                                String(
                                    b.item.data.title || ""
                                ),
                                "en"
                            );
                    }
                );
            });

        return PUBLICATION_CATEGORY_ORDER
            .filter(
                category =>
                    groups[category]?.length
            )
            .map(
                category => ({
                    title:
                        category,

                    items:
                        groups[category]
                })
            );
    }

    async function circularImageDataUrl(
        imageUrl,
        size = 320
    ) {
        const response =
            await fetch(
                absoluteUrl(imageUrl)
            );

        if (!response.ok) {
            throw new Error(
                "Could not load portrait."
            );
        }

        const blob =
            await response.blob();

        const bitmap =
            await createImageBitmap(
                blob
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

        context.clearRect(
            0,
            0,
            size,
            size
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
                size / bitmap.width,
                size / bitmap.height
            );

        const drawWidth =
            bitmap.width *
            scale;

        const drawHeight =
            bitmap.height *
            scale;

        const x =
            (size - drawWidth) /
            2;

        const y =
            (size - drawHeight) *
            0.32;

        context.drawImage(
            bitmap,
            x,
            y,
            drawWidth,
            drawHeight
        );

        context.restore();

        return canvas.toDataURL(
            "image/png"
        );
    }

    const noMargin =
        [0, 0, 0, 0];

    function sectionHeading(title) {
        return {
            margin:
                [0, 18, 0, 8],

            columns: [
                {
                    width: 5,

                    canvas: [
                        {
                            type: "rect",
                            x: 0,
                            y: 0,
                            w: 5,
                            h: 18,
                            color: COLORS.teal
                        }
                    ]
                },

                {
                    width: "*",

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

    function timelineEntry(
        date,
        title,
        details = []
    ) {
        return {
            unbreakable:
                true,

            margin:
                [0, 0, 0, 7],

            columns: [
                {
                    width: 78,

                    text:
                        date || "",

                    style:
                        "date"
                },

                {
                    width: "*",

                    stack: [
                        {
                            text:
                                title || "",

                            style:
                                "entryTitle",

                            margin:
                                noMargin
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

    function compactEntry(
        title,
        metaLines = []
    ) {
        return {
            unbreakable:
                true,

            margin:
                [0, 0, 0, 6],

            stack: [
                {
                    text:
                        title,

                    style:
                        "entryTitle"
                },

                ...metaLines
                    .filter(Boolean)
                    .map(
                        line => ({
                            text:
                                line,

                            style:
                                "entryMeta",

                            margin:
                                [0, 2, 0, 0]
                        })
                    )
            ]
        };
    }

    function statusText(value) {
        if (!value) {
            return "";
        }

        return String(value)
            .replace(/\s+/g, " ")
            .trim();
    }

    function teachingMeta(meta) {
        const ordered = [
            "Location",
            "Term",
            "Type",
            "SWS",
            "Language"
        ];

        return ordered
            .filter(
                key =>
                    meta[key]
            )
            .map(
                key =>
                    `${key}: ${meta[key]}`
            )
            .join(" · ");
    }

    function thesisMeta(meta) {
        const ordered = [
            "Role",
            "First Supervisor",
            "Second Supervisor",
            "Location",
            "Term",
            "Type",
            "Language"
        ];

        return ordered
            .filter(
                key =>
                    meta[key]
            )
            .map(
                key =>
                    `${key}: ${meta[key]}`
            );
    }

    function projectMeta(metadata) {
        const ordered = [
            "Duration",
            "Funding",
            "Applicants",
            "Coordination",
            "Funder"
        ];

        return ordered
            .filter(
                key =>
                    metadata[key]
            )
            .map(
                key =>
                    `${key}: ${metadata[key]}`
            );
    }

    function buildDocumentDefinition(
        model,
        portrait
    ) {
        const content = [];

        content.push({
            margin:
                [0, 0, 0, 18],

            table: {
                widths:
                    [90, "*"],

                body: [[
                    {
                        border:
                            [false, false, false, false],

                        stack: [
                            {
                                image:
                                    portrait,

                                width:
                                    78,

                                height:
                                    78,

                                alignment:
                                    "center"
                            }
                        ],

                        margin:
                            [0, 0, 8, 0]
                    },

                    {
                        border:
                            [false, false, false, false],

                        stack: [
                            {
                                text:
                                    model.profile.name,

                                style:
                                    "name"
                            },

                            {
                                text:
                                    model.profile.position,

                                style:
                                    "position",

                                margin:
                                    [0, 3, 0, 0]
                            },

                            {
                                text:
                                    model.profile.institution,

                                style:
                                    "institution",

                                margin:
                                    [0, 1, 0, 8]
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

                                    model.profile.email &&
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
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: 515,
                    y2: 0,
                    lineWidth: 1.2,
                    lineColor: COLORS.warm
                }
            ],

            margin:
                [0, 0, 0, 6]
        });

        model.cv.forEach(section => {
            content.push(
                sectionHeading(
                    section.title
                )
            );

            section.blocks
                .forEach(block => {
                    if (
                        block.type ===
                        "entry"
                    ) {
                        const entry =
                            block.entry;

                        content.push(
                            timelineEntry(
                                entry.date,
                                entry.title,
                                [
                                    entry.meta,
                                    entry.detail
                                ]
                            )
                        );
                    }

                    if (
                        block.type ===
                        "subsection"
                    ) {
                        content.push(
                            subsectionHeading(
                                block.title
                            )
                        );

                        block.entries
                            .forEach(entry => {
                                content.push(
                                    timelineEntry(
                                        entry.date,
                                        entry.title,
                                        [
                                            entry.meta,
                                            entry.detail
                                        ]
                                    )
                                );
                            });
                    }
                });
        });

        content.push(
            sectionHeading(
                "Publications"
            )
        );

        model.publications
            .forEach(group => {
                content.push(
                    subsectionHeading(
                        group.title
                    )
                );

                group.items
                    .forEach(record => {
                        const bibliography =
                            bibliographyText(
                                record
                            );

                        content.push({
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
                        });
                    });
            });

        content.push(
            sectionHeading(
                "Talks"
            )
        );

        model.talks
            .forEach(talk => {
                const detail = [
                    talk.event,
                    talk.location,

                    talk.collaborators
                        ? `With: ${talk.collaborators}`
                        : "",

                    talk.status
                        ? `Status: ${talk.status}`
                        : ""
                ];

                content.push(
                    timelineEntry(
                        talk.date,
                        talk.title,
                        detail
                    )
                );
            });

        content.push(
            sectionHeading(
                "Teaching"
            )
        );

        model.teaching
            .forEach(course => {
                content.push(
                    compactEntry(
                        course.title,
                        [
                            teachingMeta(
                                course.meta
                            )
                        ]
                    )
                );
            });

        content.push(
            sectionHeading(
                "Thesis Supervisions"
            )
        );

        model.theses
            .forEach(thesis => {
                content.push(
                    compactEntry(
                        thesis.title,

                        thesisMeta(
                            thesis.meta
                        )
                    )
                );
            });

        content.push(
            sectionHeading(
                "Organized Events"
            )
        );

        model.events
            .forEach(event => {
                const details = [
                    [
                        event.type,
                        event.location
                    ]
                        .filter(Boolean)
                        .join(" · "),

                    ...event.roles
                ];

                content.push(
                    timelineEntry(
                        event.date,
                        event.title,
                        details
                    )
                );

                if (
                    event.editions?.length
                ) {
                    event.editions
                        .forEach(
                            edition => {
                                content.push({
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
                                });
                            }
                        );
                }
            });

        content.push(
            sectionHeading(
                "Academic Service"
            )
        );

        model.services
            .forEach(section => {
                content.push(
                    subsectionHeading(
                        section.title
                    )
                );

                section.entries
                    .forEach(entry => {
                        content.push(
                            timelineEntry(
                                entry.date,
                                entry.title,
                                [
                                    entry.detail,
                                    entry.institution
                                ]
                            )
                        );
                    });
            });

        content.push(
            sectionHeading(
                "Projects & Funding"
            )
        );

        model.projects
            .forEach(project => {
                const lines =
                    projectMeta(
                        project.metadata
                    );

                if (
                    project.status
                ) {
                    lines.unshift(
                        `Status: ${statusText(project.status)}`
                    );
                }

                content.push(
                    timelineEntry(
                        project.period,
                        project.title,
                        lines
                    )
                );
            });

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

                position: {
                    fontSize:
                        10.5,

                    bold:
                        true,

                    color:
                        COLORS.teal
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

            footer: (
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
                .replace(/\s+/g, "_")}_CV.pdf`;

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