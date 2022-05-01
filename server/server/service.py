from typing import List
from flask import request

from commons.logging import LoggerFactory

from daos import (
    ScrapedHtmlFile as HtmlFile,
    ScrapedHtmlFileIndexEntry as Entry,
    ScrapingMethod as Method,
    RssEntryIndexEntry as RssEntry
)

from .config import app


server_logger = LoggerFactory.get_logger('scraper-server')
extension_logger = LoggerFactory.get_logger('scraper-extension')


@app.route('/save-logs', methods=["POST"])
def save_logs():
    params = request.json if request.is_json else {}
    messages = '\n'.join(params.get('logs'))

    extension_logger.log(messages, build_message=False)

    server_logger.success('Successfully logged new extension messages!')
    return {'status': 'ok'}


@app.route('/save-html', methods=["POST"])
def save_html():
    server_logger.info('Request received for "/save-html"')
    method = Method.get_or_create(name='ml-studies-scraper')

    params = request.json if request.is_json else {}

    url = params.get('url').split('?')[0]
    dom_changes_observed = params.get('dom_changes_observed')

    if dom_changes_observed < 20:
        server_logger.info(f"Aborted saving HTML - Not enough dom changes : {dom_changes_observed}")
        return {'status': 'ok'}

    file = HtmlFile()
    file.contents = params.get('html')
    file.flush()

    entry = Entry()

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

    server_logger.success("Successfully saved HTML")
    return {'status': 'ok'}
