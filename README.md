Experimental Web Dev for Resume & Portfolio Building
=
- Using AI tools to speed up the development process and learning what tools are useful.

Goals
-
1. Replace a static pdf of my resume to an interactive web page.
2. Add useful or interesting projects to my web page.
3. Add journal entries
   - Product and Service Ideas
   - Solutions to problems I am having
     
Roadmap: 
-
| Steps | Description | Progress |
|-------|-------------|----------|
| 1.| Move PDF resume to a web page | Completed |
| 2.| Add related resume information to my web page | Work in Progress |
| 3.| Test out 1 new AI tool | Pending |
| 4.| Make something useful with that AI tool | Pending |
| 5.| Test out another AI tool | Pending |
| 6.| Make another useful thing with that AI tool | Pending |

Ideas:
-
| Solution | Description | Progress |
|------------------|-------------|----------|
| Wiki Page for  | Pending | Pending |

## How to Run This Website

This website has been updated to a dynamic Flask application and requires a server to run correctly. Please follow these steps to run the website locally:

### 1. Set Up the Environment

First, make sure you have Python installed. Then, create a virtual environment and install the required dependencies.

```bash
# Create and activate a virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`

# Install the dependencies
pip install -r requirements.txt
```

### 2. Initialize the Database

The website now uses a database to store projects. You need to initialize the database before running the server for the first time.

```bash
# Set the FLASK_APP environment variable
export FLASK_APP=app.py  # On Windows, use `set FLASK_APP=app.py`

# Initialize the database
flask init-db
```

### 3. Run the Server

Now you can run the Flask server.

```bash
# The FLASK_APP variable should still be set from the previous step
flask run --port=8001
```

The server will start, and you can view the website by opening your browser and navigating to **http://localhost:8001/**.

**Important:** You must access the website through this localhost URL. Opening the HTML files directly in your browser will not work and will result in broken styling and functionality.

### Troubleshooting

If the styling still looks broken, try clearing your browser's cache for this website.

