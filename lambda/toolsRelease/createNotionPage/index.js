/* global fetch */
let fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        console.log("event", event);
        const { body, headers } = event;
        const options = {
            method: "POST",
            headers: {
                "Authorization": event.headers.Authorization,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: body
        };
        const result = await fetch(`https://api.notion.com/v1/pages`, options);
    
        const createdPage = await result.json();
        console.log(createdPage);
    
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(createdPage),
        };
        return response;
    } catch (err) {
        const response = {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify(err),
        };
        return response;
    }

};
