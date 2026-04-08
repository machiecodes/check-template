# Check Template

This action will read all issue templates in a repository, extract the titles of each input field and compare with the
headings in an issue's body. If the issue does not match any templates, it will be automatically closed, optionally with
a custom message posted and a label applied.

## Usage

```yaml
name: Issue Moderation

on:
  issues:
    types: [ opened ]

jobs:
  check-template:
    runs-on: ubuntu-latest
    
    permissions:
      issues: write
      contents: read
      
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v6

      - name: Check Template
        uses: machiecodes/check-template@v1.0.1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          close-message: "@${issue.user.login} please reopen this issue using one of the provided templates."
          close-label: "invalid"
```

Both inputs are optional. If `close-message` is omitted a default message is posted; if `close-label` is omitted no 
label is applied.

You can use JavaScript template syntax in `close-message` to reference issue data; the message is evaluated against the
GitHub [webhook payload](https://docs.github.com/en/webhooks/webhook-events-and-payloads#issues). For example, you can 
mention a user with `@${issue.user.login}`.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
