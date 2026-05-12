import json
import time
from flask import Blueprint, request, Response, stream_with_context
from jinja2 import TemplateError
from lib.config import DEFAULT_DELAY, MAX_PER_DAY
from lib.render import render
from lib.mailer import send_email

send_bp = Blueprint("send", __name__)

@send_bp.route("/send", methods=["POST"])
def send():
    data = request.get_json()
    template = data.get("template", "")
    subject = data.get("subject", "")
    rows = data.get("rows", [])
    delay = max(5, min(60, int(data.get("delay", DEFAULT_DELAY))))

    if len(rows) > MAX_PER_DAY:
        return Response(
            f"data: {json.dumps({'done': True, 'error': f'Exceeds MAX_PER_DAY cap of {MAX_PER_DAY}'})}\n\n",
            mimetype="text/event-stream"
        )

    def generate():
        sent = 0
        failed = 0
        total = len(rows)

        for i, row in enumerate(rows):
            try:
                html = render(template, row)
                subj = render(subject, row)
                to = row.get("email") or row.get("Email") or row.get("EMAIL", "")
                send_email(to, subj, html)
                yield f"data: {json.dumps({'i': i, 'total': total, 'to': to, 'status': 'ok'})}\n\n"
                sent += 1
            except (TemplateError, Exception) as e:
                to = row.get("email") or row.get("Email") or row.get("EMAIL", "")
                yield f"data: {json.dumps({'i': i, 'total': total, 'to': to, 'status': 'error', 'error': str(e)})}\n\n"
                failed += 1

            if i < total - 1:
                time.sleep(delay)

        yield f"data: {json.dumps({'done': True, 'sent': sent, 'failed': failed})}\n\n"

    resp = Response(stream_with_context(generate()), mimetype="text/event-stream")
    resp.headers["Cache-Control"] = "no-cache"
    resp.headers["X-Accel-Buffering"] = "no"
    return resp
