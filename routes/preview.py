from flask import Blueprint, request, jsonify
from jinja2 import TemplateError
from lib.render import render

preview_bp = Blueprint("preview", __name__)

@preview_bp.route("/preview", methods=["POST"])
def preview():
    data = request.get_json()
    template = data.get("template", "")
    subject = data.get("subject", "")
    row = data.get("row", {})

    try:
        rendered_html = render(template, row)
        rendered_subject = render(subject, row)
    except TemplateError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"subject": rendered_subject, "html": rendered_html})
