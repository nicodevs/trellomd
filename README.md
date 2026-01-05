# Trello to Markdown

Fetch cards from specific Trello lists and output them in Markdown format.

## Quick Setup

Run the interactive setup wizard:

```bash
npm install
npm run setup
```

The wizard will guide you through:
- Getting your Trello API key and token
- Selecting your board
- Choosing which lists to include
- Configuring how cards are retrieved from each list

## Manual Setup

If you prefer to configure manually, follow these steps:

### 1. Create a Trello Power-Up and generate API key

Trello requires you to create an application (aka a "Power-Up") to access the API:

1. Go to https://trello.com/power-ups/admin
2. Click "New" to create a new Power-Up
3. Fill in the required fields:
   - **App Name**: Something like "Markdown Export Tool" (for your reference)
   - **Workspace**: Select your workspace
   - **Email, Support contact**: Your email address
   - **Author**: Your name
   - **Iframe connector URL**: Leave blank
4. Click "Create"
5. After creation, you'll be redirected to the **API Key** section of your Power-Up
6. Click "Generate a new API key"
7. Copy the API key - you'll need it for the next step

### 2. Get your token

Use the following link to get your token (replace `YOUR_API_KEY` with the API key from the previous step):

```
https://trello.com/1/authorize?expiration=never&scope=read&response_type=token&key=YOUR_API_KEY
```

Click "Allow" to generate the token. Copy it - you'll need it for the next step.

### 3. Get your board ID

Open your Trello board and look at the URL. The board ID is the string after `/b/` and before the board name.

For example:

- If the URL is `https://trello.com/b/j8b4tQ42/my-board`
- The board ID is `j8b4tQ42`.

### 4. Configure the application

Create a `config.json` file in the project root with the following structure:

```json
{
  "apiKey": "your_api_key_here",
  "apiToken": "your_api_token_here",
  "board": "your_board_id_here",
  "heading": "@EOD",
  "ignoreArchived": true,
  "recentActivityHours": 12,
  "lists": [
    { "name": "Doing", "mode": "all" },
    { "name": "Staging", "mode": "withRecentActivity", "title": "Deployed to Staging" },
    { "name": "Done", "mode": "withRecentActivity", "title": "Deployed to Production" }
  ]
}
```

Replace `your_api_key_here`, `your_api_token_here`, and `your_board_id_here` with the values you obtained in the previous steps. Customize the `lists` array to match the lists on your Trello board.

## Installation

```bash
npm install
```

## Usage

Run the script:

```bash
npm run start
```
