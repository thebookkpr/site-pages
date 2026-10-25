# site-pages

Small single-file HTML tools and pages for my website, including a volunteer timesheet that submits entries to my own server.

Each tool lives in its own folder and runs in the browser with no build step and no dependencies.

**Author:** [@thebookkpr](https://github.com/thebookkpr)

## Contents

| Folder | What it is |
|---|---|
| [`timesheet/`](timesheet/) | Volunteer timesheet: log days and hours, keep daily notes, save past pay periods, and print or export a weekly recap. |

## Volunteer timesheet

- Add a day with a date, start and end times, and an optional task
- Daily notes for each day worked
- Past timesheets: save a finished pay period, then reopen or delete it later
- Weekly recap, grouped Sunday to Saturday, that you can print or copy
- Export as a printable page or a CSV spreadsheet
- Entries are stored in the browser and can also be sent to a server

### Remote submission

The page can send each entry to an endpoint on my website.

1. Open `timesheet/index.html`.
2. Set `ENDPOINT` near the top of the script to your submission URL.
3. The server must accept a POST request with a JSON body like this:

```json
{
  "date": "2026-10-25",
  "start": "09:00",
  "end": "13:30",
  "task": "Food pantry sorting"
}
```

4. The server should validate every field, reject bad input, and save the entry to a file or database.
5. Serve the endpoint over HTTPS. If the page and the endpoint are on different domains, the endpoint must send CORS headers allowing the page's origin.

**Secrets:** never put API keys or passwords in this repository or in the page's code. Anyone who can view the page can read them. Keep any secret on the server.

## Running locally

Open any `index.html` directly in a browser. To test remote submission, serve the folder over HTTP instead:

```
git clone https://github.com/thebookkpr/site-pages.git
cd site-pages
python3 -m http.server
```

Then visit `http://localhost:8000/timesheet/`.

## Adding a new page

1. Create a new folder with an `index.html` inside it.
2. Add a row to the Contents table above.

## Notes

- Browser storage is per device and per browser. Clearing site data erases saved timesheets, so use the CSV or printable export as a backup.
- GitHub Pages can host these pages, but it is static: it cannot receive submissions. The endpoint has to run on my own site or a form service.

## License

Released under the [MIT License](LICENSE).
