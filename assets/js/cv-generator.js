(() => {

    "use strict";


    /* =========================================
       Configuration
    ========================================== */

    const COLORS = {
        navy: "#123348",
        blue: "#19405d",
        teal: "#17525b",
        muted: "#486c78",
        warm: "#bb9e76",
        pale: "#edf3f3",
        line: "#d7e0e3",
        white: "#ffffff",
        link: "#19405d"
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


    /* =========================================
       Basic helpers
    ========================================== */

    const normalizeText = value =>
        String(value || "")
            .replace(/\s+/g, " ")
            .trim();


    const text = (root, selector) =>
        normalizeText(
            root?.querySelector(selector)
                ?.textContent
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


    const directChildren = (
        element,
        selector
    ) =>
        Array.from(
            element?.children || []
        )
            .filter(
                child =>
                    child.matches(selector)
            );


    function hasContent(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return false;
        }


        if (
            typeof value === "string"
        ) {
            return Boolean(
                normalizeText(value)
            );
        }


        if (
            Array.isArray(value)
        ) {

            return value.some(
                item =>
                    hasContent(
                        typeof item === "object"
                            ? item.text
                            : item
                    )
            );

        }


        if (
            typeof value === "object"
        ) {

            return hasContent(
                value.text
            );

        }


        return false;

    }


    /* =========================================
       Fetching
    ========================================== */

    async function fetchDocument(url) {

        const response =
            await fetch(
                absoluteUrl(url),
                {
                    credentials:
                        "same-origin"
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


    async function fetchSvg(url) {

        if (!url) {
            return "";
        }


        try {

            const response =
                await fetch(
                    absoluteUrl(url),
                    {
                        credentials:
                            "same-origin"
                    }
                );


            if (!response.ok) {
                return "";
            }


            return await response.text();

        }
        catch {

            return "";

        }

    }


    /* =========================================
       Link helpers
    ========================================== */

    function extractLink(element) {

        if (!element) {
            return "";
        }


        const anchor =
            element.matches?.("a")
                ? element
                : element.querySelector("a");


        if (!anchor) {
            return "";
        }


        return absoluteUrl(
            anchor.getAttribute("href")
        );

    }


    function extractLinks(
        root,
        selector
    ) {

        return Array.from(
            root.querySelectorAll(
                selector
            )
        )
            .map(anchor => ({

                label:
                    normalizeText(
                        anchor.textContent
                    ),

                url:
                    absoluteUrl(
                        anchor.getAttribute(
                            "href"
                        )
                    )
            }))
            .filter(
                link =>
                    link.label &&
                    link.url
            );

    }


    function linkedText(
        value,
        url,
        options = {}
    ) {

        if (!url) {

            return {
                text:
                    value,

                ...options
            };

        }


        return {
            text:
                value,

            link:
                url,

            color:
                COLORS.link,

            decoration:
                "none",

            ...options
        };

    }


    function resourceLine(links) {

        if (
            !links ||
            !links.length
        ) {
            return null;
        }


        const runs = [];


        links.forEach(
            (link, index) => {

                if (index > 0) {
                    runs.push(" · ");
                }


                runs.push(
                    linkedText(
                        link.label,
                        link.url
                    )
                );

            }
        );


        return runs;

    }


    /* =========================================
       Rich HTML -> pdfmake inline text
    ========================================== */

    function richInline(
        element,
        options = {}
    ) {

        if (!element) {
            return "";
        }


        const breakSeparator =
            options.breakSeparator ??
            " · ";


        const runs = [];


        function walk(
            node,
            inherited = {}
        ) {

            if (
                node.nodeType ===
                Node.TEXT_NODE
            ) {

                const value =
                    String(
                        node.nodeValue || ""
                    )
                        .replace(
                            /\s+/g,
                            " "
                        );


                if (
                    value.trim()
                ) {

                    runs.push({
                        text:
                            value,

                        ...inherited
                    });

                }


                return;

            }


            if (
                node.nodeType !==
                Node.ELEMENT_NODE
            ) {
                return;
            }


            const tag =
                node.tagName
                    .toLowerCase();


            if (
                tag === "br"
            ) {

                runs.push(
                    breakSeparator
                );

                return;

            }


            const formatting = {
                ...inherited
            };


            if (
                tag === "em" ||
                tag === "i"
            ) {
                formatting.italics =
                    true;
            }


            if (
                tag === "strong" ||
                tag === "b"
            ) {
                formatting.bold =
                    true;
            }


            if (
                tag === "a"
            ) {

                formatting.link =
                    absoluteUrl(
                        node.getAttribute(
                            "href"
                        )
                    );

                formatting.color =
                    COLORS.link;

                formatting.decoration =
                    "none";

            }


            Array.from(
                node.childNodes
            )
                .forEach(
                    child =>
                        walk(
                            child,
                            formatting
                        )
                );

        }


        Array.from(
            element.childNodes
        )
            .forEach(
                node =>
                    walk(node)
            );


        if (
            runs.length &&
            typeof runs[0] === "object"
        ) {

            runs[0].text =
                String(
                    runs[0].text
                )
                    .replace(
                        /^\s+/,
                        ""
                    );

        }


        const last =
            runs[
                runs.length - 1
            ];


        if (
            last &&
            typeof last === "object"
        ) {

            last.text =
                String(
                    last.text
                )
                    .replace(
                        /\s+$/,
                        ""
                    );

        }


        return runs;

    }


    /* =========================================
       CV-specific detail extraction
    ========================================== */

    function extractCvDetail(element) {

        if (!element) {
            return "";
        }


        const label =
            text(
                element,
                ".cv-entry-thesis-label"
            );


        const anchors =
            Array.from(
                element.querySelectorAll(
                    "a"
                )
            );


        if (
            label &&
            anchors.length
        ) {

            const runs = [
                {
                    text:
                        label,

                    color:
                        COLORS.muted
                },
                " "
            ];


            anchors.forEach(
                (anchor, index) => {

                    if (index > 0) {
                        runs.push(" · ");
                    }


                    runs.push(
                        linkedText(
                            normalizeText(
                                anchor.textContent
                            ),
                            absoluteUrl(
                                anchor.getAttribute(
                                    "href"
                                )
                            )
                        )
                    );

                }
            );


            return runs;

        }


        return richInline(
            element,
            {
                breakSeparator:
                    " · "
            }
        );

    }


    /* =========================================
       Profile
    ========================================== */

    function socialHandle(
        url,
        type
    ) {

        if (!url) {
            return "";
        }


        try {

            const parsed =
                new URL(url);


            const parts =
                parsed.pathname
                    .split("/")
                    .filter(Boolean);


            const last =
                parts[
                    parts.length - 1
                ] || "";


            if (
                type === "mastodon"
            ) {

                return last.startsWith("@")
                    ? last
                    : `@${last}`;

            }


            return last;

        }
        catch {

            return url;

        }

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
                        )
                            .toLowerCase() ===
                        label.toLowerCase()
                );


            return link
                ? absoluteUrl(
                    link.getAttribute(
                        "href"
                    )
                )
                : "";

        };


        const email =
            findLink("Email")
                .replace(
                    /^mailto:/i,
                    ""
                );


        const orcid =
            findLink("ORCID");


        const github =
            findLink("GitHub");


        const mastodon =
            findLink("Fedihum");


        return {
            name:
                button.dataset.name ||
                "Erik Renz",

            address:
                button.dataset.address ||
                "",

            birthDate:
                button.dataset.birthDate ||
                "",

            photo:
                button.dataset.photo ||
                "",

            email,

            website:
                window.location.origin,

            orcid: {
                url:
                    orcid,

                handle:
                    socialHandle(
                        orcid,
                        "orcid"
                    )
            },

            github: {
                url:
                    github,

                handle:
                    socialHandle(
                        github,
                        "github"
                    )
            },

            mastodon: {
                url:
                    mastodon,

                handle:
                    socialHandle(
                        mastodon,
                        "mastodon"
                    )
            },

            iconUrls: {
                orcid:
                    button.dataset
                        .orcidIcon ||
                    "",

                github:
                    button.dataset
                        .githubIcon ||
                    "",

                mastodon:
                    button.dataset
                        .mastodonIcon ||
                    ""
            }
        };

    }


    /* =========================================
       CV page
    ========================================== */

    function extractCvEntry(entry) {

        const titleElement =
            entry.querySelector(
                ".cv-entry-title"
            );


        const metaElement =
            entry.querySelector(
                ".cv-entry-meta"
            );


        const detailElement =
            entry.querySelector(
                ".cv-entry-thesis"
            );


        return {
            date:
                text(
                    entry,
                    ".cv-entry-date"
                ),

            title:
                richInline(
                    titleElement
                ),

            meta:
                richInline(
                    metaElement,
                    {
                        breakSeparator:
                            " · "
                    }
                ),

            detail:
                extractCvDetail(
                    detailElement
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


    /* =========================================
       Talks
    ========================================== */

    function extractTalks(
        documentNode
    ) {

        return Array.from(
            documentNode.querySelectorAll(
                ".talk-item"
            )
        )
            .map(item => {

                const resources =
                    extractLinks(
                        item,
                        ".talk-resource-button"
                    );


                return {
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
                        ),

                    resources
                };

            })
            .filter(
                item =>
                    item.title
            );

    }


    /* =========================================
       Teaching and thesis metadata
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


    function extractTeaching(
        documentNode
    ) {

        return Array.from(
            documentNode.querySelectorAll(
                ".teaching-course"
            )
        )
            .map(course => {

                const titleElement =
                    course.querySelector(
                        ".teaching-course-title"
                    );


                return {
                    title:
                        normalizeText(
                            titleElement
                                ?.textContent
                        ),

                    titleLink:
                        extractLink(
                            titleElement
                        ),

                    meta:
                        badgeMap(
                            course,
                            ".teaching-badge"
                        )
                };

            })
            .filter(
                course =>
                    course.title
            );

    }


    function extractTheses(
        documentNode
    ) {

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


    /* =========================================
       Academic year helpers
    ========================================== */

    function termInformation(term) {

        const value =
            normalizeText(term);


        const winter =
            value.match(
                /^Winter\s+(\d{4})\/(\d{2})$/i
            );


        if (winter) {

            const start =
                Number(
                    winter[1]
                );


            const end =
                winter[2];


            return {
                academicYear:
                    `${start}/${end}`,

                groupSort:
                    start,

                termSort:
                    start * 10 + 2,

                label:
                    value
            };

        }


        const summer =
            value.match(
                /^Summer\s+(\d{4})$/i
            );


        if (summer) {

            const year =
                Number(
                    summer[1]
                );


            const start =
                year - 1;


            const end =
                String(year)
                    .slice(-2);


            return {
                academicYear:
                    `${start}/${end}`,

                groupSort:
                    start,

                termSort:
                    year * 10 + 1,

                label:
                    value
            };

        }


        return {
            academicYear:
                value ||
                "Other",

            groupSort:
                0,

            termSort:
                0,

            label:
                value
        };

    }


    function groupByAcademicYear(
        items
    ) {

        const groups =
            new Map();


        items.forEach(item => {

            const term =
                item.meta?.Term ||
                "";


            const info =
                termInformation(
                    term
                );


            if (
                !groups.has(
                    info.academicYear
                )
            ) {

                groups.set(
                    info.academicYear,
                    {
                        title:
                            info.academicYear,

                        sort:
                            info.groupSort,

                        items: []
                    }
                );

            }


            groups
                .get(
                    info.academicYear
                )
                .items
                .push({
                    ...item,

                    termInfo:
                        info
                });

        });


        return Array.from(
            groups.values()
        )
            .sort(
                (a, b) =>
                    b.sort - a.sort
            )
            .map(group => ({

                ...group,

                items:
                    group.items
                        .sort(
                            (a, b) =>
                                b.termInfo
                                    .termSort -
                                a.termInfo
                                    .termSort
                        )
            }));

    }


    /* =========================================
       Organized Events
    ========================================== */

    function extractEvents(
        documentNode
    ) {

        return Array.from(
            documentNode.querySelectorAll(
                ".event-item"
            )
        )
            .map(item => {

                const titleElement =
                    item.querySelector(
                        ".event-item-title"
                    );


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
                                [
                                    name,
                                    detail
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                            );

                        })
                        .filter(Boolean);


                const resources =
                    extractLinks(
                        item,
                        ":scope > .event-item-content > .event-item-links .event-resource-button"
                    );


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
                                ),

                            resources:
                                extractLinks(
                                    edition,
                                    ".event-resource-button"
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
                        normalizeText(
                            titleElement
                                ?.textContent
                        ),

                    titleLink:
                        extractLink(
                            titleElement
                        ),

                    location:
                        text(
                            item,
                            ".event-item-location"
                        ),

                    roles,
                    resources,
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

    function extractServices(
        documentNode
    ) {

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
                        .map(entry => {

                            const titleElement =
                                entry.querySelector(
                                    ".service-entry-title"
                                );


                            return {
                                date:
                                    text(
                                        entry,
                                        ".service-entry-date"
                                    ),

                                title:
                                    normalizeText(
                                        titleElement
                                            ?.textContent
                                    ),

                                titleLink:
                                    extractLink(
                                        titleElement
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
                            };

                        })
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

    function extractProjects(
        documentNode
    ) {

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


                const resources =
                    extractLinks(
                        project,
                        ".project-resource-button"
                    );


                const website =
                    resources.find(
                        link =>
                            /project website/i
                                .test(
                                    link.label
                                )
                    );


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

                    titleLink:
                        website?.url ||
                        "",

                    status:
                        text(
                            project,
                            ".project-status"
                        ),

                    metadata,

                    resources:
                        resources.filter(
                            link =>
                                link.url !==
                                website?.url
                        )
                };

            })
            .filter(
                project =>
                    project.title
            );

    }


    /* =========================================
       Zotero helpers
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


    function creatorName(
        creator
    ) {

        if (creator.name) {
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
        creatorType
    ) {

        return (
            data.creators ||
            []
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
            getTags(
                item.data
            );


        if (
            directTags.includes(
                WEBSITE_TAGS[
                    tagName
                ]
            )
        ) {
            return true;
        }


        const key =
            itemKey(item);


        return Boolean(
            key &&
            websiteTagKeys[
                tagName
            ]?.has(key)
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
            item.data
                ?.itemType;


        if (
            hasWebsiteTag(
                item,
                "editedJournalIssue",
                websiteTagKeys
            )
        ) {
            return "Edited Journal Issues";
        }


        if (
            type === "book"
        ) {
            return "Books";
        }


        if (
            type === "journalArticle"
        ) {
            return "Journal Articles";
        }


        if (
            type === "bookSection" ||
            type === "encyclopediaArticle"
        ) {
            return "Book Chapters";
        }


        if (
            type === "conferencePaper"
        ) {
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

        const limit =
            100;

        let start =
            0;


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
                batch.length <
                limit
            ) {
                break;
            }


            start += limit;

        }


        const clean =
            items.filter(item => {

                const type =
                    item?.data
                        ?.itemType;


                return (
                    item?.data &&
                    type !==
                        "attachment" &&
                    type !==
                        "note" &&
                    type !==
                        "annotation"
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


    /* =========================================
       Publication bibliography
    ========================================== */

    function bibliographyText(
        record
    ) {

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
                : record.status ||
                "n.d.";


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
            type ===
            "journalArticle"
        ) {

            parts.push(
                `“${title}.”`
            );


            let venue =
                normalizeText(
                    data.publicationTitle
                );


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


            const bookTitle =
                normalizeText(
                    data.bookTitle
                );


            if (bookTitle) {

                let sentence =
                    `In ${bookTitle}`;


                if (editors) {

                    sentence +=
                        `, edited by ${editors}`;

                }


                if (data.pages) {

                    sentence +=
                        `, ${data.pages}`;

                }


                sentence +=
                    ".";


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
            type ===
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


        return normalizeText(
            parts.join(" ")
        );

    }


    function publicationUrls(
        data
    ) {

        const links =
            [];


        if (data.DOI) {

            links.push(
                `https://doi.org/${String(data.DOI)
                    .replace(
                        /^https?:\/\/doi\.org\//i,
                        ""
                    )}`
            );

        }


        if (
            data.url &&
            /^https?:\/\//i
                .test(
                    data.url
                )
        ) {

            links.push(
                data.url
            );

        }


        const seen =
            new Set();


        return links.filter(
            url => {

                const normalized =
                    url
                        .replace(
                            /\/$/,
                            ""
                        )
                        .toLowerCase();


                if (
                    seen.has(
                        normalized
                    )
                ) {
                    return false;
                }


                seen.add(
                    normalized
                );


                return true;

            }
        );

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
                    .push(record);

            }
        );


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

            });


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


        const drawWidth =
            bitmap.width *
            scale;


        const drawHeight =
            bitmap.height *
            scale;


        const x =
            (
                size -
                drawWidth
            ) / 2;


        const y =
            (
                size -
                drawHeight
            ) * 0.32;


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


    /* =========================================
       PDF layout helpers
    ========================================== */

    function sectionHeading(
        title
    ) {

        return {
            headlineLevel:
                1,

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


    function subsectionHeading(
        title
    ) {

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
        details = [],
        options = {}
    ) {

        let titleContent =
            title;


        if (
            options.titleLink &&
            typeof title ===
                "string"
        ) {

            titleContent =
                linkedText(
                    title,
                    options.titleLink
                );

        }


        const detailNodes =
            details
                .filter(
                    hasContent
                )
                .map(
                    detail => ({

                        text:
                            detail,

                        style:
                            "entryMeta",

                        margin:
                            [0, 2, 0, 0]
                    })
                );


        if (
            options.resources
                ?.length
        ) {

            detailNodes.push({
                text:
                    resourceLine(
                        options.resources
                    ),

                style:
                    "resourceLinks",

                margin:
                    [0, 3, 0, 0]
            });

        }


        return {
            unbreakable:
                true,

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
                                titleContent,

                            style:
                                "entryTitle",

                            margin:
                                [0, 0, 0, 0]
                        },

                        ...detailNodes
                    ]
                }
            ],

            columnGap:
                10
        };

    }


    function academicYearMarker(
        academicYear
    ) {

        return {
            margin:
                [0, 9, 0, 5],

            columns: [
                {
                    width:
                        78,

                    text:
                        academicYear,

                    style:
                        "academicYear"
                },

                {
                    width:
                        "*",

                    text:
                        "Academic Year",

                    style:
                        "academicYearLabel"
                }
            ],

            columnGap:
                10
        };

    }


    function pushMajorSection(
        content,
        title,
        nodes,
        keepCount = 1
    ) {

        if (!nodes.length) {
            return;
        }


        const kept =
            nodes.slice(
                0,
                keepCount
            );


        const remaining =
            nodes.slice(
                keepCount
            );


        content.push({
            unbreakable:
                true,

            stack: [
                sectionHeading(
                    title
                ),

                ...kept
            ]
        });


        content.push(
            ...remaining
        );

    }


    function teachingMetadata(
        meta
    ) {

        return [
            meta.Type,
            meta.Location,
            meta.SWS
                ? `${meta.SWS} SWS`
                : "",
            meta.Language
        ]
            .filter(Boolean)
            .join(" · ");

    }


    function thesisMetadata(
        meta
    ) {

        const parts = [
            meta.Type,
            meta.Location,
            meta.Role
        ];


        if (
            meta["First Supervisor"] &&
            meta.Role !==
                "First Supervisor"
        ) {

            parts.push(
                `First Supervisor: ${meta["First Supervisor"]}`
            );

        }


        if (
            meta["Second Supervisor"] &&
            meta.Role !==
                "Second Supervisor"
        ) {

            parts.push(
                `Second Supervisor: ${meta["Second Supervisor"]}`
            );

        }


        if (
            meta.Language
        ) {
            parts.push(
                meta.Language
            );
        }


        return parts
            .filter(Boolean)
            .join(" · ");

    }


    function projectMetadata(
        metadata
    ) {

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


    /* =========================================
       Social profile PDF element
    ========================================== */

    function socialProfileNode(
        icon,
        handle,
        url
    ) {

        if (
            !handle ||
            !url
        ) {
            return null;
        }


        const columns = [];


        if (icon) {

            columns.push({
                width:
                    10,

                svg:
                    icon,

                fit:
                    [9, 9],

                margin:
                    [0, 1, 0, 0]
            });

        }


        columns.push({
            width:
                "auto",

            text:
                handle,

            link:
                url,

            color:
                COLORS.link,

            fontSize:
                8.2
        });


        return {
            width:
                "auto",

            columns,

            columnGap:
                3,

            margin:
                [0, 0, 12, 0]
        };

    }


    /* =========================================
       Document definition
    ========================================== */

    function buildDocumentDefinition(
        model,
        portrait
    ) {

        const content =
            [];


        const socialNodes =
            [
                socialProfileNode(
                    model.icons.orcid,
                    model.profile
                        .orcid.handle,
                    model.profile
                        .orcid.url
                ),

                socialProfileNode(
                    model.icons.github,
                    model.profile
                        .github.handle,
                    model.profile
                        .github.url
                ),

                socialProfileNode(
                    model.icons.mastodon,
                    model.profile
                        .mastodon.handle,
                    model.profile
                        .mastodon.url
                )
            ]
                .filter(Boolean);


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
                                text:
                                    [
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
                                    "personalData",

                                margin:
                                    [0, 4, 0, 0]
                            },

                            {
                                text: [
                                    model.profile.email
                                        ? linkedText(
                                            model.profile.email,
                                            `mailto:${model.profile.email}`
                                        )
                                        : "",
                                    (
                                        model.profile.email &&
                                        model.profile.website
                                    )
                                        ? "  ·  "
                                        : "",
                                    model.profile.website
                                        ? linkedText(
                                            model.profile.website,
                                            model.profile.website
                                        )
                                        : ""
                                ],

                                style:
                                    "contact",

                                margin:
                                    [0, 4, 0, 0]
                            },

                            socialNodes.length
                                ? {
                                    columns:
                                        socialNodes,

                                    margin:
                                        [0, 6, 0, 0]
                                }
                                : {}
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


        model.cv.forEach(
            section => {

                const nodes =
                    [];


                section.blocks
                    .forEach(block => {

                        if (
                            block.type ===
                            "entry"
                        ) {

                            const entry =
                                block.entry;


                            nodes.push(
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

                            if (
                                block.entries
                                    .length
                            ) {

                                const first =
                                    block.entries[0];


                                nodes.push({
                                    unbreakable:
                                        true,

                                    stack: [
                                        subsectionHeading(
                                            block.title
                                        ),

                                        timelineEntry(
                                            first.date,
                                            first.title,
                                            [
                                                first.meta,
                                                first.detail
                                            ]
                                        )
                                    ]
                                });


                                block.entries
                                    .slice(1)
                                    .forEach(
                                        entry => {

                                            nodes.push(
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
                                    );

                            }

                        }

                    });


                pushMajorSection(
                    content,
                    section.title,
                    nodes,
                    1
                );

            }
        );


        const publicationNodes =
            [];


        model.publications
            .forEach(group => {

                const entries =
                    group.items
                        .map(record => {

                            const citation =
                                bibliographyText(
                                    record
                                );


                            const urls =
                                publicationUrls(
                                    record.item.data
                                );


                            const runs = [
                                citation
                            ];


                            urls.forEach(
                                url => {

                                    runs.push(
                                        "  "
                                    );


                                    runs.push(
                                        linkedText(
                                            url,
                                            url,
                                            {
                                                fontSize:
                                                    8.1
                                            }
                                        )
                                    );

                                }
                            );


                            return {
                                margin:
                                    [0, 0, 0, 6],

                                text:
                                    runs,

                                style:
                                    "bibliography"
                            };

                        });


                if (!entries.length) {
                    return;
                }


                publicationNodes.push({
                    unbreakable:
                        true,

                    stack: [
                        subsectionHeading(
                            group.title
                        ),

                        entries[0]
                    ]
                });


                publicationNodes.push(
                    ...entries.slice(1)
                );

            });


        pushMajorSection(
            content,
            "Publications",
            publicationNodes,
            1
        );


        const talkNodes =
            model.talks
                .map(talk => {

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


                    return timelineEntry(
                        talk.date,
                        talk.title,
                        detail,
                        {
                            resources:
                                talk.resources
                        }
                    );

                });


        pushMajorSection(
            content,
            "Talks",
            talkNodes
        );


        const teachingNodes =
            [];


        groupByAcademicYear(
            model.teaching
        )
            .forEach(group => {

                if (
                    !group.items.length
                ) {
                    return;
                }


                const first =
                    group.items[0];


                teachingNodes.push({
                    unbreakable:
                        true,

                    stack: [
                        academicYearMarker(
                            group.title
                        ),

                        timelineEntry(
                            first.termInfo
                                .label,
                            first.title,
                            [
                                teachingMetadata(
                                    first.meta
                                )
                            ],
                            {
                                titleLink:
                                    first.titleLink
                            }
                        )
                    ]
                });


                group.items
                    .slice(1)
                    .forEach(course => {

                        teachingNodes.push(
                            timelineEntry(
                                course.termInfo
                                    .label,
                                course.title,
                                [
                                    teachingMetadata(
                                        course.meta
                                    )
                                ],
                                {
                                    titleLink:
                                        course.titleLink
                                }
                            )
                        );

                    });

            });


        pushMajorSection(
            content,
            "Teaching",
            teachingNodes
        );


        const thesisNodes =
            [];


        groupByAcademicYear(
            model.theses
        )
            .forEach(group => {

                if (
                    !group.items.length
                ) {
                    return;
                }


                const first =
                    group.items[0];


                thesisNodes.push({
                    unbreakable:
                        true,

                    stack: [
                        academicYearMarker(
                            group.title
                        ),

                        timelineEntry(
                            first.termInfo
                                .label,
                            first.title,
                            [
                                thesisMetadata(
                                    first.meta
                                )
                            ]
                        )
                    ]
                });


                group.items
                    .slice(1)
                    .forEach(thesis => {

                        thesisNodes.push(
                            timelineEntry(
                                thesis.termInfo
                                    .label,
                                thesis.title,
                                [
                                    thesisMetadata(
                                        thesis.meta
                                    )
                                ]
                            )
                        );

                    });

            });


        pushMajorSection(
            content,
            "Thesis Supervisions",
            thesisNodes
        );


        const eventNodes =
            [];


        model.events
            .forEach(event => {

                eventNodes.push(
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
                        ],
                        {
                            titleLink:
                                event.titleLink,

                            resources:
                                event.resources
                        }
                    )
                );


                event.editions
                    ?.forEach(
                        edition => {

                            const editionRuns = [
                                {
                                    text:
                                        edition.term,

                                    bold:
                                        true,

                                    color:
                                        COLORS.teal
                                }
                            ];


                            if (
                                edition.meta
                            ) {

                                editionRuns.push(
                                    ` · ${edition.meta}`
                                );

                            }


                            const resources =
                                resourceLine(
                                    edition.resources
                                );


                            if (resources) {

                                editionRuns.push(
                                    " · "
                                );


                                editionRuns.push(
                                    ...resources
                                );

                            }


                            eventNodes.push({
                                margin:
                                    [88, -3, 0, 5],

                                text:
                                    editionRuns,

                                style:
                                    "entryMeta"
                            });

                        }
                    );

            });


        pushMajorSection(
            content,
            "Organized Events",
            eventNodes
        );


        const serviceNodes =
            [];


        model.services
            .forEach(section => {

                if (
                    !section.entries
                        .length
                ) {
                    return;
                }


                const first =
                    section.entries[0];


                serviceNodes.push({
                    unbreakable:
                        true,

                    stack: [
                        subsectionHeading(
                            section.title
                        ),

                        timelineEntry(
                            first.date,
                            first.title,
                            [
                                first.detail,
                                first.institution
                            ],
                            {
                                titleLink:
                                    first.titleLink
                            }
                        )
                    ]
                });


                section.entries
                    .slice(1)
                    .forEach(entry => {

                        serviceNodes.push(
                            timelineEntry(
                                entry.date,
                                entry.title,
                                [
                                    entry.detail,
                                    entry.institution
                                ],
                                {
                                    titleLink:
                                        entry.titleLink
                                }
                            )
                        );

                    });

            });


        pushMajorSection(
            content,
            "Academic Service",
            serviceNodes
        );


        const projectNodes =
            model.projects
                .map(project => {

                    const details =
                        projectMetadata(
                            project.metadata
                        );


                    if (
                        project.status
                    ) {

                        details.unshift(
                            `Status: ${project.status}`
                        );

                    }


                    return timelineEntry(
                        project.period,
                        project.title,
                        details,
                        {
                            titleLink:
                                project.titleLink,

                            resources:
                                project.resources
                        }
                    );

                });


        pushMajorSection(
            content,
            "Projects & Funding",
            projectNodes
        );


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


                personalData: {
                    fontSize:
                        9,

                    color:
                        COLORS.muted,

                    lineHeight:
                        1.3
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


                academicYear: {
                    fontSize:
                        9,

                    bold:
                        true,

                    color:
                        COLORS.teal
                },


                academicYearLabel: {
                    fontSize:
                        7.6,

                    bold:
                        true,

                    color:
                        COLORS.muted,

                    characterSpacing:
                        0.55
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


                resourceLinks: {
                    fontSize:
                        8.1,

                    color:
                        COLORS.link,

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


    /* =========================================
       Model loading
    ========================================== */

    async function loadModel(
        button
    ) {

        const [
            cvDocument,
            talksDocument,
            teachingDocument,
            eventsDocument,
            servicesDocument,
            projectsDocument,
            publicationRecords,
            orcidIcon,
            githubIcon,
            mastodonIcon
        ] =
            await Promise.all([

                fetchDocument(
                    button.dataset
                        .cvUrl
                ),

                fetchDocument(
                    button.dataset
                        .talksUrl
                ),

                fetchDocument(
                    button.dataset
                        .teachingUrl
                ),

                fetchDocument(
                    button.dataset
                        .eventsUrl
                ),

                fetchDocument(
                    button.dataset
                        .servicesUrl
                ),

                fetchDocument(
                    button.dataset
                        .projectsUrl
                ),

                fetchPublications(
                    button.dataset
                        .zoteroUserId
                ),

                fetchSvg(
                    button.dataset
                        .orcidIcon
                ),

                fetchSvg(
                    button.dataset
                        .githubIcon
                ),

                fetchSvg(
                    button.dataset
                        .mastodonIcon
                )
            ]);


        return {
            profile:
                extractProfile(
                    button
                ),

            icons: {
                orcid:
                    orcidIcon,

                github:
                    githubIcon,

                mastodon:
                    mastodonIcon
            },

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
       PDF generation
    ========================================== */

    async function generatePdf(
        button,
        status
    ) {

        if (
            !window.pdfMake
        ) {

            throw new Error(
                "pdfmake is not available."
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