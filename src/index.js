import * as github from '@actions/github';
import * as core from "@actions/core";
import * as fs from "fs";
import * as path from "path";

const token = process.env.GITHUB_TOKEN;
const message = core.getInput('close-message');
const label = core.getInput('close-label');

const context = github.context;

const TEMPLATE_DIR = '.github/ISSUE_TEMPLATE/';

(async () => {
    const body = context.payload.issue.body;

    if (!body) {
        await closeIssue();
        return;
    }

    const bHeaders = body
        .split('\n')
        .filter(line => line.startsWith('### '))
        .map(line => line.substring(4));

    const templateFiles = fs.readdirSync(TEMPLATE_DIR).filter(file => !file.startsWith('config'));
    let isTemplate = false;

    for (const templateFile of templateFiles) {
        const template = fs.readFileSync(path.join(TEMPLATE_DIR, templateFile), 'utf8');

        const tHeaders = template
            .split('\n')
            .filter(line => line.trim().startsWith('label: '))
            .map(line => line.trim().substring(7));

        if (JSON.stringify(tHeaders) === JSON.stringify(bHeaders)) {
            isTemplate = true;
            break;
        }
    }

    if (!isTemplate) {
        await closeIssue();
    }
})();

async function closeIssue() {
    const octokit = github.getOctokit(token);
    const issueNumber = context.payload.issue.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    const closeMessage = message
        ? Function(...Object.keys(context.payload), `return \`${message}\``)(...Object.values(context.payload))
        : '### This issue is being automatically closed.\n' +
        'Please reopen your issue following one of the templates.';

    try {
        await octokit.rest.issues.createComment({
            owner, repo, issue_number: issueNumber, body: closeMessage
        });
    } catch (error) {
        core.error(`Failed to add comment: ${error.message}`);
    }

    if (label) {
        try {
            await octokit.rest.issues.addLabels({
                owner, repo, issue_number: issueNumber, labels: [label]
            });
        } catch (error) {
            core.setFailed(`Failed to add label: ${error.message}`);
        }
    }

    try {
        await octokit.rest.issues.update({
            owner, repo, issue_number: issueNumber, state: 'closed', state_reason: 'not_planned'
        });
    } catch (error) {
        core.setFailed(`Failed to close issue: ${error.message}`);
    }
}