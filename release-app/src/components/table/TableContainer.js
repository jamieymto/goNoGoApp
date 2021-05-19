import React from "react";
import TableRow from "./TableRow";
import "react-tabs/style/react-tabs.css";
import "./table.css";

const TableContainer = (props) => {
    const { result, qaResult, project } = props;
    const isLoading = !result || !result.commits;
    const isEmpty = result.commits && result.commits.length === 0;
    return (
        <div className="table-container">
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Issue Type</th>
                            <th>Commit Hash</th>
                            <th>Commit Message</th>
                            <th>Author</th>
                            <th>In QA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading || isEmpty ? (
                            <tr>
                                <td colSpan={5}>
                                    <em>
                                        {isLoading && "Loading ..."}
                                        {isEmpty && "No new commits since previous release"}
                                    </em>
                                </td>
                            </tr>
                        ) : (
                            result.commits &&
                            result.commits.map((commit, index) => (
                                <TableRow
                                    project={project}
                                    key={index}
                                    index={index + 1}
                                    commit={commit}
                                    qaCommits={qaResult}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default TableContainer;
