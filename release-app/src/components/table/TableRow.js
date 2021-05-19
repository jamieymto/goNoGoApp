import React from "react";
import { slideDown, slideUp } from "../../animations/expand";
import { parseTicket, parseType } from "../../helpers/commitMessageHelpers";
import "../../index.css";

export default class TableRow extends React.Component {
    state = { expanded: false };

    toggleExpander = () => {
        if (!this.state.expanded) {
            this.setState({ expanded: true }, () => {
                if (this.refs.expanderBody) {
                    slideDown(this.refs.expanderBody);
                }
            });
        } else {
            slideUp(this.refs.expanderBody, {
                onComplete: () => {
                    this.setState({ expanded: false });
                },
            });
        }
    };

    render() {
        const { commit, qaCommits, project } = this.props;
        return [
            <tr key="main" className="parentRow" onClick={this.toggleExpander}>
                <td>{parseType(commit.message)}</td>
                <td>{commit.commitSha}</td>
                <td>{commit.message.split("\n")[0]}</td>
                <td>{commit.author.name}</td>
                <td>{qaCommits.includes(commit.message) ? "yes" : "no"}</td>
            </tr>,
            this.state.expanded && (
                <tr className="expandable" key="tr-expander">
                    <td colSpan={6}>
                        <div ref="expanderBody" className="inner">
                            <div>
                                {parseTicket(commit.message).map((ticketData, index) => (
                                    <div key={index}>
                                        <h3>Linear Tickets</h3>
                                        <a href={ticketData.link}>
                                            {ticketData.id}
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <div>
                            <h3>GitHub Commits</h3>
                                <a href={`https://github.com/Produce8/${project}/commit/${commit.commitSha}`}>
                                    {commit.commitSha}
                                </a>
                            </div>
                        </div>
                    </td>
                </tr>
            ),
        ];
    }
}
