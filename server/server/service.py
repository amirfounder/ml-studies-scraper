from typing import List

from daos import (
    ScrapedHtmlFile as HtmlFile,
    ScrapedHtmlFileIndexEntry as Entry,
    ScrapingMethod as Method,
    RssEntryIndexEntry as RssEntry
)
from flask import request

from .config import app


@app.route('/save-html', methods=["POST"])
def save_html():
    method = Method.get_or_create(name='ml-studies-scraper')

    params = request.json if request.is_json else {}

    file = HtmlFile()
    file.contents = params.get('html')
    file.flush()

    entry = Entry()

    url = params.get('url').split('?')[0]

    entry.url = url
    entry.scraped_at = params.get('scraped_at')
    entry.session_id = params.get('session_id')
    entry.dom_changes_observed = params.get('dom_changes_observed')
    entry.ms_elapsed_on_webpage = params.get('ms_elapsed_on_webpage')
    entry.method_used_id = method.id
    entry.file_path = file.path
    entry.flush()

    rss_entries: List[RssEntry] = RssEntry.all(url=url)
    if len(rss_entries) == 1:
        rss_entry = rss_entries[0]
        rss_entry.has_been_scraped = True
        rss_entry.flush()

    return {'status': 'SUCCESS'}
