# Trello to Markdown

Fetch cards from specific Trello lists and output them in Markdown format.

## Setup

### 1. Get your board ID

Open your Trello board and look at the URL. The board ID is the string after `/b/` and before the board name. For example, if the URL is `https://trello.com/b/j8b4tQ42/my-board`, the board ID is `j8b4tQ42`.

Set the board ID in your `.env` file: `TRELLO_BOARD_ID=your_board_id`.

### 2. Create a Trello Power-Up and generate API key

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
7. Set the API key in your `.env` file: `TRELLO_API_KEY=your_api_key`.

### 3. Get your token

Use the following link to get your token (replace `YOUR_API_KEY` with the API key from the previous step):

```
https://trello.com/1/authorize?expiration=never&scope=read&response_type=token&key=YOUR_API_KEY
```

Click "Allow" to generate the token. Copy it and set it in your `.env`, `TRELLO_API_TOKEN=your_token`.

## Installation

```bash
npm install
```

## Usage

Run the script:

```bash
npm run start
```
