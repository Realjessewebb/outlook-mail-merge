import csv
import io
from flask import Blueprint, request, jsonify
import openpyxl

parse_bp = Blueprint("parse", __name__)

MAX_ROWS = 200

@parse_bp.route("/parse", methods=["POST"])
def parse():
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "No file provided"}), 400

    name = f.filename.lower()

    if name.endswith(".csv"):
        text = f.read().decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        rows = [dict(r) for r in reader][:MAX_ROWS]
        columns = list(rows[0].keys()) if rows else []

    elif name.endswith(".xlsx"):
        wb = openpyxl.load_workbook(f, read_only=True, data_only=True)
        ws = wb.active
        rows_iter = ws.iter_rows(values_only=True)
        headers = [str(h) for h in next(rows_iter)]
        rows = []
        for raw in rows_iter:
            if len(rows) >= MAX_ROWS:
                break
            rows.append(dict(zip(headers, [str(v) if v is not None else "" for v in raw])))
        columns = headers

    else:
        return jsonify({"error": "Unsupported file type — use .csv or .xlsx"}), 400

    return jsonify({"columns": columns, "rows": rows})
