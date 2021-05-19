import React, { useEffect, useState } from "react";

const DropDownOptions = ({ commits }) => {
    const commitHashes = Object.keys(commits).map((commitHash, index) => {
        return (
            <option key={index} value={commits[commitHash].commitSha}>
                {commits[commitHash].commitSha}
            </option>
        );
    });
    return commitHashes;
};

const DropDown = ({ label, value, commits, onChange }) => {
    return (
        <label>
            {label}
            <select value={value} onChange={onChange}>
                <option>-- select a commit --</option>
                <DropDownOptions commits={commits} />
            </select>
        </label>
    );
};

const TextInput = ({ label, placeholder, value, onChange }) => {
    return (
        <label>
            {label}
            <input type="text" placeholder={placeholder} value={value} onChange={onChange} />
        </label>
    );
};

const ReleaseForm = (props) => {
    const EMPTY_OPTION = "-- select a commit --";
    const {
        commits,
        releaseName,
        releaseVersion,
        startingCommitHash,
        endingCommitHash,
        parsedCommits,
        handleCommitDetailChange,
        handleSubmit,
        handleReleaseNameChange,
        handleReleaseVersionChange,
        handleStartingCommitChange,
        handleEndingCommitChange,
    } = props;
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        setIsDisabled(
            releaseName.length === 0 ||
                startingCommitHash.length === 0 ||
                startingCommitHash.includes(EMPTY_OPTION) ||
                endingCommitHash.length === 0 ||
                endingCommitHash.includes(EMPTY_OPTION)
        );
    }, [releaseName, startingCommitHash, endingCommitHash]);

    return (
        <form onSubmit={handleSubmit}>
            <TextInput
                label={"Release Name"}
                value={releaseName}
                placeholder={"Earwig Release V1.4.3"}
                onChange={handleReleaseNameChange}
            />
            <TextInput
                label={"Release Version (all lower case with v prefix)"}
                value={releaseVersion}
                placeholder={"v1.4.3"}
                onChange={handleReleaseVersionChange}
            />
            <DropDown
                label={"Choose Ending commit"}
                value={endingCommitHash}
                commits={commits}
                onChange={handleEndingCommitChange}
            />
            <DropDown
                label={"Choose Starting commit"}
                value={startingCommitHash}
                commits={[commits[Object.keys(commits).pop()]]}
                onChange={handleStartingCommitChange}
            />
            {parsedCommits &&
                parsedCommits.length > 0 &&
                parsedCommits.map((pc, index) => (
                        <div key={index} className="form-group col-sm-6">
                            <label htmlFor="commitDetail">{pc.commitMessage}</label>
                            <input
                                key={index}
                                type="textarea"
                                className="form-control"
                                id="commitDetail"
                                name="commitDetail"
                                placeholder="Notes regarding this commit"
                                value={pc.detail}
                                onChange={(event) => handleCommitDetailChange(index, event)}
                            />
                        </div>
                ))}

            <input type="submit" value="Submit" disabled={isDisabled} />
        </form>
    );
};

export default ReleaseForm;
