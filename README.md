# karnatakabirdmonitoring

## Shared header and footer

The shared markup is in `partials/header.html` and `partials/footer.html`. Pages include `#site-header` and `#site-footer` placeholders and load `js/layout.js`; edit the partials to update the navigation or footer across the site. Serve the project over HTTP so the browser can fetch these files.

## Resources page

The district volunteer list is generated in `js/resources.js`; replace the demo names there with real volunteer names. Update the tutorial `href` values and certificate generator link in `resources.html` when their URLs are available.

## Adding events

Event data lives in a separate JSON file for each event:

```text
events/
  index.json
  your-event-id/
    event.json
    images/
```

To add an event:

1. Create a folder under `events/` using a unique, URL-friendly ID.
2. Add an `event.json` in that folder. Set `id` to the folder ID and `type` to `past` or `future`. Include the title, category, date, location, image, short description, description paragraphs, and `details` (`when`, `where`, `how`, `challenges`, `additionalInformation`, and `tutorials`).
3. Add the event JSON path to the `events` array in `events/index.json`.
4. Put event photos in that event’s `images/` folder and list them in `gallery` as objects with `src`, `alt`, and `credit` fields. Optionally add `creditUrl` to link a photographer or source. Use paths relative to the repository root, for example `events/your-event-id/images/photo-1.jpg`. The `image` field can use a local path as well.
5. Add `pressRelease` (title, description, and URL) and `bannerUrl` for every event. For past events, add `stats`, `gallery`, and `testimonials` as needed.

The event list, homepage event cards, and event detail pages load the JSON files listed in `events/index.json`. Serve the project over HTTP (rather than opening the HTML files directly) so the browser can fetch the JSON. For a quick local preview, run `python3 -m http.server` from the repository root and open `http://localhost:8000/events.html`.

Event galleries and testimonials display three items per page. When there are more than three, left and right arrow controls move between pages.