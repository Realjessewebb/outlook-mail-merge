# Outlook Mail Merge

A small local web app for sending personalized emails from your LMU Office 365
account. Upload a spreadsheet of recipients, write one email with `{{ column }}`
placeholders, preview it, and send it to each person, one at a time, with a delay
between messages.

Everything runs on your own computer. Nothing is uploaded anywhere except the
emails you send through Outlook.

## What you need

- Windows, macOS or Linux
- Python 3.10 or newer ([python.org](https://www.python.org/downloads/). On
  Windows, tick **"Add python.exe to PATH"** during install.)
- An LMU Microsoft 365 email account

## One-time setup

1. Unzip this folder somewhere, e.g. `Documents\outlook-mailmerge`.
2. Copy `emailproxy.config.example` to a new file named `emailproxy.config`.
   Open it and replace **both** occurrences of `YOUR_LMU_EMAIL@lmu.edu` with your
   own address.
3. Open `lib\config.py` and set `FROM_EMAIL` to the same address.

## Running it

**Windows:** double-click `start.bat`.

The first run installs the dependencies, which takes a minute. After that it opens two
windows: the **emailproxy** window and the app window. It also opens
<http://localhost:5000> in your browser.

**Mac/Linux:**

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m emailproxy --config-file emailproxy.config --no-gui --local-server-auth &
.venv/bin/python app.py
```

Then open <http://localhost:5000>.

### Signing in the first time

The first time you send (or dry-run then send), the **emailproxy** window prints
a Microsoft sign-in link. Copy it into your browser, sign in with your LMU
account, and approve. The proxy saves the login (in `emailproxy.config`), so you
only do this once. **Don't share your `emailproxy.config` after signing in.** It
contains your login token.

## Using it

1. **Recipients:** upload a `.csv` or `.xlsx`. The first row must be the column
   headers, and one column must be named `email`. Up to 200 rows are loaded.
2. **Compose:** write a subject and body. Click a column chip to insert a
   placeholder like `{{ first_name }}`. See `templates/example.html` for an example.
3. **Preview:** step through recipients to see exactly what each one gets.
4. **Dry run:** renders every email without sending anything.
5. **Send:** sends one email at a time, with the delay you choose (5–60 s,
   default 15 s), so Outlook doesn't flag you for spam. You can cancel mid-send.
   Optional CC addresses are added to every email.

## How it works

`app.py` is a Flask server. Emails go out over SMTP to a local
[Email OAuth 2.0 Proxy](https://github.com/simonrob/email-oauth2-proxy) on
port 1025. The proxy handles Microsoft's modern sign-in and forwards the email to
`smtp.office365.com`.

## Troubleshooting

- **"Python not found":** reinstall Python with "Add to PATH" ticked, then
  delete the `.venv` folder and run `start.bat` again.
- **Connection refused on send:** the emailproxy window isn't running. Close
  everything and run `start.bat` again.
- **Authentication errors:** check that your email address is the same in all
  three places (both spots in `emailproxy.config`, and `lib\config.py`). Some
  tenants require IT to allow SMTP AUTH for your mailbox.

## License

MIT. See [LICENSE](LICENSE). Free to use, modify and share. No warranty.
