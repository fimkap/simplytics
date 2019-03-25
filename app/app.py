"""Simple analytics engine service.

Collect analytics of web usage such as page views, clicks,
user writings, query params and mouse moves vectors.

Save information into Redis data store.
"""
import os
import logging

from flask import Flask, json
from flask_cors import CORS
from flask import request
from redis import Redis
from urllib import parse
from werkzeug.exceptions import BadRequest


app = Flask(__name__)
CORS(app)
redis = Redis(host=os.environ['REDIS_HOST'], port=os.environ['REDIS_PORT'])
bind_port = int(os.environ['BIND_PORT'])


def pageview_update(req_form):
    """Increment the page view and the total views count."""
    page_path = req_form['path']
    client_id = req_form['clientid']
    redis.incr("page:"+page_path+":"+client_id)
    redis.incr("pagetotal:")


def click_update(req_form):
    """Increment the clicks count."""
    client_id = req_form['clientid']
    redis.incr("clicks:"+client_id)


def text_update(req_form):
    """Add the text to the set."""
    text = req_form['text']
    client_id = req_form['clientid']
    redis.sadd("text:"+client_id, text)


def query_update(req_form):
    """Increment the query parameters count."""
    query_params = req_form['query']
    client_id = req_form['clientid']
    params = dict(parse.parse_qsl(query_params))
    for key, value in params.items():
        redis.incr("query:"+client_id+":"+key+":"+value)


def moves_update(req_form):
    """Add the mouse move point sequence to the set."""
    moves = req_form['moves']
    client_id = req_form['clientid']
    redis.sadd("moves:"+client_id, moves)


@app.route('/analytics', methods=['POST'])
def analytics():
    """The analytics engine entrypoint.

       Arguments:
       	mode: the mode (type of statistics) to update
    """
    try:
        mode = request.args.get('mode')
        if mode == "pageview":
            pageview_update(request.form)
        elif mode == "click":
            click_update(request.form)
        elif mode == "text":
            text_update(request.form)
        elif mode == "query":
            query_update(request.form)
        elif mode == "moves":
            moves_update(request.form)
    except Exception as e:
        raise BadRequest('Bad request')
            
    return app.response_class(status=200)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, port=bind_port)
