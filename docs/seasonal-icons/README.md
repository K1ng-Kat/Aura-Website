# Public Aura seasonal icon feed

The **public** feed is `https://aura-macos.vercel.app/seasonal-icons/manifest.json`.
The `Aura-Website/docs/` folder is the Vercel/GitHub Pages static site.

The separate **Seasonal Icon Uploader** utility can publish an image and a future UTC activation timestamp to this repository using a *user-supplied, repo-restricted GitHub fine-grained personal access token* held in the iPhone Keychain. **No credential is committed or embedded in the app.**

Each image is stored here under `seasonal-icons/<unique-id>.png` or `.jpg`, and a `schemaVersion: 1` manifest entry is appended:

```json
{
  "id": "spring-abc123",
  "title": "Spring",
  "unlockAtUTC": "2027-03-01T05:00:00Z",
  "imageURL": "https://aura-macos.vercel.app/seasonal-icons/spring-abc123.png",
  "sha256": "sha256-of-exact-image-bytes"
}
```

Aura Mac and Aura iOS already have matching feed readers which validate the host, HTTPS scheme, SHA-256 digest, size, ID, schema and trusted activation time. Existing copies **that already contain the feed reader** can receive new artwork without a subsequent app binary update; older releases without that code still need one initial app update.

**Important:** iPhone system Home Screen alternate icons are bundled resources. Downloaded future imagery updates the **in-app seasonal preview**, not the SpringBoard icon. Mac can apply art to its running Dock icon while Seasonal Mystery is selected.

Private CloudKit uploads in the uploader remain personal; only deliberate **Publish to Everyone** actions put art in this public repo. GitHub commits automatically redeploy the Vercel static site when production Git integration is enabled. Image files are content-unique, and the manifest is pushed only after the image upload is confirmed. Publishing requires the GitHub token's Contents write permission **only on K1ng-Kat/Aura-Website**, not an unrestricted account token.

Validate the feed publicly after deployment, not only from a signed-in Vercel preview; production Vercel deployment protection could block clients.
