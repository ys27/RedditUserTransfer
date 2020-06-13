# RedditUserTransfer

Web UI to transfer the transferrable components of a reddit user:

1. Saved posts/comments
2. Subscribed subreddits
3. User preferences

You need to add a client/src/config.json as such:

```
{
    "clientId": "",
    "clientSecret": "",
    "redirectURI": "http://localhost:3000"
}
```

Where the client id and secret are for the Reddit API, and the redirect URI is for the site.

The server only exists to serve the static html of the site. It can be run by itself using react-scripts.
