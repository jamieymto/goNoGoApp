import GHcst from "github-commits-since-tag";
import * as base64 from "base-64";
import { DEV } from "../constants/Branch";

export const getCommitsSinceLatestTag = async (projectName) => {
    const ghcst = new GHcst({
        user: process.env.REACT_APP_GH_USERNAME,
        token: process.env.REACT_APP_GH_API_KEY,
    });
    // getRepoCommitsSinceTag
    // commitsForRepo

    const repoSinceLatestTag = await ghcst.getLatestTag({ full_name: projectName });
    const commitsSinceTag = await ghcst.getRepoCommitsSinceTag(
        { full_name: projectName },
        repoSinceLatestTag.tag
    );
    const devCommits = await getLatestCommits(projectName, DEV);
    const treeCommits = devCommits.reduce((a,x) => ({...a, [x.commit.tree.sha]: x.sha}), {});
    console.log(devCommits[0]);
    commitsSinceTag.commits.forEach((commit, index) => {
        const commitSha = treeCommits[commit.tree.sha];
        commitsSinceTag.commits[index].commitSha = commitSha;
    });
    const latestTag = commitsSinceTag.tag;
    console.log(projectName);
    console.log(commitsSinceTag);
    return { commitsSinceTag, latestTag};
};

export const getLatestCommits = async (projectName, branchName) => {
    let headers = new Headers();

    headers.append("Accept", "application/vnd.github.v3+json");
    headers.append(
        "Authorization",
        "Basic " +
            base64.encode(
                process.env.REACT_APP_GH_USERNAME + ":" + process.env.REACT_APP_GH_API_KEY
            )
    );

    const result = await fetch(`https://api.github.com/repos/${projectName}/commits?sha=${branchName}`, {
        method: "GET",
        headers,
    });
    const commits = await result.json();
    return commits;
};

export const getLatestCommitMessages = async (projectName, branchName) => {
    const commits = await getLatestCommits(projectName, branchName);
    let commitMessages = [];
    commits.forEach((commit) => {
        commitMessages.push(commit.commit.message);
    });
    console.log(commitMessages);
    return commitMessages;
}

export const createTag = async (projectName, tag, commitSha) => {
    let headers = new Headers();

    headers.append("Accept", "application/vnd.github.v3+json");
    headers.append(
        "Authorization",
        "Basic " +
            base64.encode(
                process.env.REACT_APP_GH_USERNAME + ":" + process.env.REACT_APP_GH_API_KEY
            )
    );
    const requestBody = {
        tag,
        message: `Release ${tag}`,
        object: commitSha,
        type: "commit"
    };

    const result = await fetch(`https://api.github.com/repos/${projectName}/git/tags`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
    });
    const commits = await result.json();
    return commits;
};

export const createRelease = async (projectName, tag, commitSha, releaseName, markDown) => {
    let headers = new Headers();

    headers.append("Accept", "application/vnd.github.v3+json");
    headers.append(
        "Authorization",
        "Basic " +
            base64.encode(
                process.env.REACT_APP_GH_USERNAME + ":" + process.env.REACT_APP_GH_API_KEY
            )
    );
    const requestBody = {
        tag_name: tag,
        target_commitish: commitSha,
        name: `${releaseName}`,
        message: `Release ${tag}`,
        body: markDown || "",
        draft: false, 
        prerelease: false
    };

    const result = await fetch(`https://api.github.com/repos/${projectName}/releases`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
    });
    const commits = await result.json();
    return commits;
};

export const release = async (projectName, tag, commitSha, piCodeName, markDown) => {
    await createTag(projectName, tag, commitSha);
    const newRelease = await createRelease(projectName, tag, commitSha, piCodeName, markDown);
    return newRelease;
};

