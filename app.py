from flask import Flask, render_template, jsonify, request
import sqlite3
import click
from flask.cli import with_appcontext

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db_connection()
    with app.open_resource('schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()
    db.close()

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

app.cli.add_command(init_db_command)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/skills')
def skills():
    return render_template('skills.html')

@app.route('/experience')
def experience():
    return render_template('experience.html')

@app.route('/education')
def education():
    return render_template('education.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

@app.route('/api/projects', methods=['GET'])
def get_projects():
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects ORDER BY date DESC').fetchall()
    conn.close()
    return render_template('_project_list.html', projects=projects)

@app.route('/api/projects', methods=['POST'])
def add_project():
    new_project = request.form.to_dict()
    conn = get_db_connection()
    conn.execute('INSERT INTO projects (name, description, url, date) VALUES (?, ?, ?, ?)',
                 (new_project['name'], new_project['description'], new_project['url'], new_project['date']))
    conn.commit()
    conn.close()

    # Return the updated list of projects
    conn = get_db_connection()
    projects = conn.execute('SELECT * FROM projects ORDER BY date DESC').fetchall()
    conn.close()
    return render_template('_project_list.html', projects=projects)

if __name__ == '__main__':
    app.run(debug=True, port=8001)
