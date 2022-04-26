from daos import BetterScrapingHtmlFile as HtmlFile
from daos import DocumentIndexEntry as Entry
from flask import request

from .config import app


@app.route('/save-html', methods=["POST"])
def save_html():
    params = request.json if request.is_json else {}

    file = HtmlFile()
    file.contents = params.get('html')
    file.flush()

    entry = Entry()
    entry.from_dict(params)
    entry.document_path = file.path
    entry.flush()

    return {'status': 'SUCCESS'}
