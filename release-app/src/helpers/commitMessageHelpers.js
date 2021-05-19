function parseType(commitMessage) {
    if (commitMessage.includes(":")) {
        return commitMessage.split(":")[0];
    }
    return "task";
}

function parseTicket(commitMessage) {
    const loweredCommitMessage = commitMessage.toLowerCase();
    const projectCode = "pro-";
    const ticketNumSplit = loweredCommitMessage.split(projectCode);
    ticketNumSplit.shift();
    const ticketIds = [];
    const tickets = [];
    ticketNumSplit.forEach((ticket) => {
        const ticketNum = ticket.split(" ")[0];
        if (!ticketIds.includes(ticketNum)) {
            const ticketId = `PRO-${ticketNum}`;
            const projectBaseUrl = "https://linear.app/produce8/issue/";
            tickets.push({
                id: ticketId,
                link: `${projectBaseUrl}${ticketId}`,
            });
            ticketIds.push(ticketId);
        }
    });
    return tickets;
}

export { parseType, parseTicket };
