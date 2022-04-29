from daos import (
    ScrapedHtmlFile as HtmlFile,
    ScrapedHtmlFileIndexEntry as Entry,
    ScrapingMethod as Method
)
from flask import request

from .config import app


@app.route('/save-html', methods=["POST"])
def save_html():
    params = request.json if request.is_json else {}

    file = HtmlFile()
    file.contents = params.get('html')
    file.flush()

    method = next(iter(Method.all(name='ml-studies-scraper')), None)
    if not method:
        method = Method(name='ml-studies-scraper')
        method.flush()

    entry = Entry()
    entry.from_dict(params)
    entry.method_used_id = method.id
    entry.file_path = file.path
    entry.flush()

    return {'status': 'SUCCESS'}
