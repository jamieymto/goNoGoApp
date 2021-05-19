import React from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import { getCommitsSinceLatestTag, getLatestCommitMessages } from "./helpers/githubHelper";

import ReleaseContainer from "./components/form/ReleaseContainer";
import Table from "./components/table/TableContainer";
import Loading from "./components/loading/LoadingContainer";
import { QA } from "./constants/Branch";

import "react-tabs/style/react-tabs.css";
import "./index.css";

class App extends React.Component {
    state = { webCommits: [], beCommits: [], webQaCommits: [], beQaCommits: [], webDevCommits: [], beDevCommits: [], webTag: "", beTag: "", isLoading: true };

    init = async () => {
        const backendRepo = "produce8/p8-backend";
        const webRepo = "produce8/p8-web";

        const { commitsSinceTag: web, latestTag: webTag } = await getCommitsSinceLatestTag(webRepo);
        const webQa = await getLatestCommitMessages(webRepo, QA);
        const { commitsSinceTag: be, latestTag: beTag} = await getCommitsSinceLatestTag(backendRepo);
        const beQa = await getLatestCommitMessages(backendRepo, QA);


        this.setState({
            webCommits: web,
            beCommits: be,
            webQaCommits: webQa,
            beQaCommits: beQa,
            webTag: webTag.name,
            beTag: beTag.name,
            isLoading: false,
        });
    };

    async componentDidMount() {
        await this.init();
    }

    render() {
        const { webCommits, beCommits, webQaCommits, beQaCommits, webTag, beTag } = this.state;
        return (
            <main>
                {this.state.isLoading && <Loading />}
                {!this.state.isLoading && (
                    <Tabs>
                        <TabList>
                            <Tab>P8-Web</Tab>
                            <Tab>P8-Backend</Tab>
                        </TabList>

                        <TabPanel className="tabContainer">
                            <h2>Produce8 Web - Since Last Release {webTag}</h2>
                            <Table project={"p8-web"} result={webCommits} qaResult={webQaCommits} />
                            {webCommits && webCommits.commits && (
                                <div className="releaseContainer">
                                    <h2>Produce8 Web - Create Release</h2>
                                    <p>Previous Release - {webTag}</p>
                                    <ReleaseContainer project={"p8-web"}  result={webCommits} />
                                </div>
                            )}
                        </TabPanel>
                        <TabPanel className="tabContainer">
                            <h2>Produce8 Backend - Since Last Release {beTag}</h2>
                            <Table
                                project={"p8-backend"}
                                result={beCommits}
                                qaResult={beQaCommits}
                            />
                            {beCommits && beCommits.commits && (
                                <div className="releaseContainer">
                                    <h2>Produce8 Backend - Create Release</h2>
                                    <p>Previous Release - {beTag}</p>
                                    <ReleaseContainer project={"p8-backend"} result={beCommits} />
                                </div>
                            )}
                        </TabPanel>
                    </Tabs>
                )}
            </main>
        );
    }
}

export default App;
