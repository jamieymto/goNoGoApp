/**
 * Parsed Commit
 *
 * [{
 *     commitMessage: "Feat: PRO-251 add feature toggle for CW Subscription mutation (#99)",
 *     commitType: "Feat",
 *     issues: [{
 *         id: "PRO-251",
 *         link: "https://linear.app/produce8/issue/PRO-251"
 *     }]
 * }]
 *
 * */

/**
 * Notion Request Body
 * {
 *     "parent": {
 *         "type": "page_id",
 *         "page_id": "0bd704da-a08a-4d0a-9e81-94af678597f5"
 *     },
 *     "properties": {
 *         "title": [
 *             {
 *                 "text": {
 *                     "content": "test"
 *                 }
 *             }
 *         ],
 *         "children": [
 *             {
 *                     "object": "block",
 *                     "type": "paragraph",
 *                     "paragraph": {
 *                         "text": [
 *                             {
 *                                 "type": "text",
 *                                 "text": {
 *                                     "content": "'$SUBJECT'",
 *                                     "link": {
 *                                         "url": "https://github.com/Produce8/'$repo'/commit/'$HASH'"
 *                                     }
 *                                 }
 *                             }
 *                         ]
 *                     }
 *             }
 *         ]
 *     }
 * }
 *
 */

export const createPage = (releaseName, pageBlocks) => {
    const parent = {
        parent: {
            type: "page_id",
            page_id: process.env.REACT_APP_NOTION_PAGE_ID,
        },
        properties: {
            title: [
                {
                    text: {
                        content: releaseName,
                    },
                },
            ],
        },
        children: pageBlocks,
    };
    return parent;
};

export const createPageBlock = (blockTitle, blockBody) => {
    const blockHeader = [
        {
            object: "block",
            type: "heading_2",
            heading_2: {
                text: [
                    {
                        type: "text",
                        text: {
                            content: blockTitle,
                        },
                    },
                ],
            },
        },
    ];
    const block = blockHeader.concat(blockBody);
    return block;
};

export const getParagraph = (annotation) => {
    return {
        object: "block",
        type: "paragraph",
        paragraph: {
            text: [
                {
                    type: "text",
                    text: {
                        content: "",
                        link: null,
                    },
                    ...(annotation && { annotations: annotation }),
                },
            ],
        },
    };
};

export const createBody = (commits) => {
    let features = [];
    let bugs = [];
    let featuresMd = [];
    let bugsMd = [];
    commits.forEach((commit) => {
        const commitMessageMarkdown = commit.commitMessage;
        const detail = commit.detail;

        const issueLinks = [];
        const detailMarkdown = [];
        const blocks = [];

        const type = commit.commitType.toLowerCase();
        const block = getParagraph({
            bold: true,
        });

        block.paragraph.text[0].text.content = commit.commitMessage;
        blocks.push(block);

        commit.issues.forEach((issue) => {
            const linkBlock = getParagraph({
                italic: true,
            });
            linkBlock.paragraph.text[0].text.content = issue.id;
            linkBlock.paragraph.text[0].text.link = {
                type: "url",
                url: issue.link,
            };
            blocks.push(linkBlock);
            issueLinks.push(`* [${issue.id}](${issue.link})`);
        });

        if (detail.length > 0) {
            const detailBlock = getParagraph();
            detailBlock.paragraph.text[0].text.content = detail;
            blocks.push(detailBlock);
            const detailHeaderMarkdown = `### Notes`;
            detailMarkdown.push(detailHeaderMarkdown);
            detailMarkdown.push(`${detail}`);
        }
        if (type.includes("feat")) {
            features = features.concat(blocks);
            featuresMd.push(commitMessageMarkdown);
            featuresMd.push(issueLinks);
            featuresMd = featuresMd.concat(detailMarkdown);
            featuresMd.push("\n");
        } else if (type.includes("fix")) {
            bugs = bugs.concat(blocks);
            bugsMd.push(commitMessageMarkdown);
            bugsMd.push(issueLinks);
            bugsMd = bugsMd.concat(detailMarkdown);
            bugsMd.push("\n");
        }
    });
    return { features, bugs, bugsMd, featuresMd };
};

export const createReleasePage = async (requestBody) => {
    const result = await fetch(`https://api-internal.produce8-staging.com/createnotionpage`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        mode: 'cors',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_NOTION_ACCESS_TOKEN}`

        }
    });
    const createdPage = await result.json();
    console.log(createdPage);
    return createdPage;
};

export const createNotionPage = async (project, releaseName, commits) => {
    const { features, bugs, featuresMd, bugsMd } = createBody(commits);
    const featuresPageBlock = createPageBlock("Features", features);
    const bugsPageBlock = createPageBlock("Bugs", bugs);

    const page = createPage(`${releaseName} - ${project}`, [
        ...featuresPageBlock,
        ...bugsPageBlock,
    ]);
    console.log(JSON.stringify(page));
    const mdPageArray = [
        `## ${releaseName} - ${project}`,
        "### Features",
        ...featuresMd,
        "### Bugs",
        ...bugsMd,
    ];
    const mdPageString = mdPageArray.join("\n");
    console.log(mdPageString);
    await createReleasePage(page);
    return mdPageString;
};
