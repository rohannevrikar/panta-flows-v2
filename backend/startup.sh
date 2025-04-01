
#!/bin/bash
cd /home/site/wwwroot
export PYTHONPATH=/home/site/wwwroot
gunicorn main:app --config gunicorn.conf.py
