# Trello to Markdown

Fetch cards from specific Trello lists and output them in Markdown format.

## Usage

```bash
npx trello-to-markdown
```

## Configuration

The first time you run it, a setup wizard will guide you through:

- Getting your Trello API key and token
- Picking a Trello board and selecting lists
- Configuring how cards are retrieved from each list

The setup wizard creates a `trello-to-markdown.config.json` file with your settings:

```json
{
  "apiKey": "your_api_key",
  "apiToken": "your_api_token",
  "board": "board_id",
  "heading": "My Daily Report",
  "ignoreArchived": true,
  "recentActivityHours": 12,
  "lists": [
    {
      "id": "list_id",
      "name": "Doing",
      "mode": "all"
    },
    {
      "id": "list_id",
      "name": "Done",
      "mode": "withRecentActivity",
      "title": "Completed Today"
    }
  ]
}
```

This JSON file will be stored in the directory from where you ran the command. Once created, feel free to move the file to another directory if needed. It contains API keys, so add it to `.gitignore` if you store it in a directory under version control.

## Generate reports

After setup, running the same command from the directory with that JSON file will generate your Markdown report.

```bash
npx trello-to-markdown
```

Example output:

```markdown
My Daily Report

*Doing*

- Implement user authentication
- Fix navigation bug - [PR #123](https://github.com/user/repo/pull/123)

*Completed Today*

- Deploy to staging - [Commit](https://github.com/user/repo/commit/abc123)
- Update documentation
```

# Manual Configuration

If you prefer to configure manually, follow these steps:

### 1. Create a Trello Power-Up

1. Go to https://trello.com/power-ups/admin
2. Click "New" to create a new Power-Up
3. Fill in the required fields:
   - **App Name**: Something like "Markdown Export Tool"
   - **Workspace**: Select your workspace
   - **Email, Support contact**: Your email
   - **Author**: Your name
4. Click "Create"
5. Copy your **API Key**

### 2. Get Your Token

Use this URL (replace `YOUR_API_KEY` with your API key from step 1):

```
https://trello.com/1/authorize?expiration=never&scope=read&response_type=token&key=YOUR_API_KEY
```

Click "Allow" and copy the token.

### 3. Get Your Board ID

Open your Trello board in a browser and look at the URL. The board ID is the string after `/b/` and before the board name.

For example, if the URL is:
```
https://trello.com/b/j8b4tQ42/my-board
```

The board ID is `j8b4tQ42`.

### 4. Create Configuration File

Create a `trello-to-markdown.config.json` file in your working directory with the following structure:

```json
{
  "apiKey": "your_api_key_here",
  "apiToken": "your_api_token_here",
  "board": "your_board_id_here",
  "heading": "My Daily Report",
  "ignoreArchived": true,
  "recentActivityHours": 12,
  "lists": []
}
```

### 5. Configure Options

- **`heading`**: The title that appears at the top of your report
- **`ignoreArchived`**: Set to `true` to exclude archived cards, `false` to include them
- **`recentActivityHours`**: Number of hours to consider for "recent activity" (used by lists with `withRecentActivity` mode)

### 6. Configure Lists

For each list you want to include in your report, you need to add an entry to the `lists` array. Each list requires:

- **`id`**: The Trello list ID (see below on how to get it)
- **`name`**: The list name (for your reference)
- **`mode`**: Either `"all"` or `"withRecentActivity"`
  - `"all"`: Includes all cards from the list
  - `"withRecentActivity"`: Only includes cards updated within the last N hours (defined by `recentActivityHours`)
- **`title`** (optional): Custom title to display in the report instead of the list name

**Getting List IDs:**

To get list IDs, you can use the Trello API. Open this URL in your browser (replace with your API key, token, and board ID):

```
https://api.trello.com/1/boards/YOUR_BOARD_ID/lists?key=YOUR_API_KEY&token=YOUR_TOKEN
```

This will return a JSON array with all lists on your board, including their IDs.

Example configuration with lists:

```json
{
  "apiKey": "your_api_key_here",
  "apiToken": "your_api_token_here",
  "board": "j8b4tQ42",
  "heading": "Daily Progress Report",
  "ignoreArchived": true,
  "recentActivityHours": 24,
  "lists": [
    {
      "id": "5f9a1b2c3d4e5f6a7b8c9d0e",
      "name": "In Progress",
      "mode": "all"
    },
    {
      "id": "6a7b8c9d0e1f2a3b4c5d6e7f",
      "name": "Done",
      "mode": "withRecentActivity",
      "title": "Completed Today"
    }
  ]
}
```

# Requirements

- Node.js >= 20.10.0

# License

MIT
