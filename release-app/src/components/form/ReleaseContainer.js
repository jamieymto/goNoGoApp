import React, { useState } from "react";
import ReleaseForm from "./ReleaseForm";
import { parseTicket, parseType } from "../../helpers/commitMessageHelpers";
import { createNotionPage } from "../../helpers/notionHelpers";
import { release } from "../../helpers/githubHelper";
import "./form.css";

const parseCommits = (commits) => {
    let commitKeyValue = {};
    commits.forEach((commit) => {
        commitKeyValue[commit.commitSha] = commit;
    });
    return commitKeyValue;
};
const ReleaseContainer = (props) => {
    const { result, project } = props;
    const commits = result && result.commits ? parseCommits(result.commits) : {};
    const [startingCommitHash, setStartingCommitHash] = useState("");
    const [endingCommitHash, setEndingCommitHash] = useState("");
    const [releaseVersion, setReleaseVersion] = useState("");
    const [releaseName, setReleaseName] = useState("");
    const [releasePageMarkDown, setReleasePageMarkDown] = useState([]);
    const [parsedCommits, setParsedCommits] = useState([]);

    const handleReleaseVersionChange = (event) => {
        event.preventDefault();
        setReleaseVersion(event.target.value);
    };

    const handleReleaseNameChange = (event) => {
        event.preventDefault();
        setReleaseName(event.target.value);
    };

    const getCommitCandidates = (startingCommit, endingCommit) => {
        let matchedEnding = false;
        let matchedStarting = false;
        const commitCandidates = [];
        Object.keys(commits).forEach((commitHash) => {
            if (!matchedStarting) {
                if (matchedEnding) {
                    if (commits[commitHash].commitSha === startingCommit) {
                        commitCandidates.push(commits[commitHash]);
                        matchedStarting = true;
                    } else {
                        commitCandidates.push(commits[commitHash]);
                    }
                } else {
                    if (commits[commitHash].commitSha === endingCommit) {
                        commitCandidates.push(commits[commitHash]);
                        matchedEnding = true;
                        matchedStarting = startingCommit === endingCommit;
                    }
                }
            }
        });
        return commitCandidates;
    };

    const parseCommitCandidates = (commitCandidates) => {
        return commitCandidates.map((cc) => {
            const issues = parseTicket(cc.message);
            const commitType = parseType(cc.message);
            const commitMessage = cc.message.split("\n")[0];
            return {
                detail: "",
                commitMessage,
                commitType,
                issues,
            };
        });
    };

    const handleCommitChange = (startingCommit, endingCommit) => {
        if (startingCommit.length > 0 && endingCommit.length > 0) {
            const commitCandidates = getCommitCandidates(startingCommit, endingCommit);
            const parsedCommitCandidates = parseCommitCandidates(commitCandidates);
            setParsedCommits(
                parsedCommitCandidates
            );
        }
    }
    const handleStartingCommitChange = (event) => {
        const startingCommit = event.target.value;
        setStartingCommitHash(startingCommit);
        handleCommitChange(startingCommit, endingCommitHash);
    };

    const handleEndingCommitChange = (event) => {
        const endingCommit = event.target.value;
        setEndingCommitHash(endingCommit);
        handleCommitChange(startingCommitHash, endingCommit);
    };

    const clearForm = () => {
        setReleaseVersion("");
        setReleaseName("");
        setStartingCommitHash("");
        setEndingCommitHash("");
        setParsedCommits([]);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (commits && parsedCommits) {
            console.log(parsedCommits);
            const markdownParagraphs = await createNotionPage(
                project,
                releaseName,
                parsedCommits
            );
            setReleasePageMarkDown(markdownParagraphs);
            console.log(markdownParagraphs);
            await release(`Produce8/${project}`, releaseVersion, endingCommitHash, releaseName, markdownParagraphs)
        }
        clearForm();
    };

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

    const handleCommitDetailChange = (index, event) => {
        const commitsToEdit = parsedCommits;
        const commitToEdit = commitsToEdit[index];
        commitToEdit.detail = event.target.value;
        setParsedCommits([...commitsToEdit]);
    }

    return (
        <>
            <ReleaseForm
                commits={commits}
                releaseName={releaseName}
                releaseVersion={releaseVersion}
                startingCommitHash={startingCommitHash}
                endingCommitHash={endingCommitHash}
                parsedCommits={parsedCommits}
                handleSubmit={handleSubmit}
                handleCommitDetailChange={handleCommitDetailChange}
                handleReleaseNameChange={handleReleaseNameChange}
                handleStartingCommitChange={handleStartingCommitChange}
                handleEndingCommitChange={handleEndingCommitChange}
                handleReleaseVersionChange={handleReleaseVersionChange}
            />
        </>
    );
};

export default ReleaseContainer;
