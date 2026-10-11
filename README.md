# Movie Helper Web Application

A web application with a frontend powered by Node.js and a backend powered by Django.

## Prerequisites

Before starting, make sure you have the following installed:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- Python 3.12 or newer

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Reza-SK/Movie-Helper-WebProject.git
cd Movie-Helper-WebProject
```

### 2. Install frontend dependencies

Go to the frontend directory:

```bash
cd frontend
```

Install the required Node.js packages:

```bash
npm install
```

Then return to the project root:

```bash
cd ..
```

### 3. Set up the backend

Go to the root directory of project then:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv-django-backend
```

Activate the virtual environment.

#### Windows Command Prompt

```cmd
.venv-django-backend\Scripts\activate
```

#### Windows PowerShell

```powershell
.\.venv-django-backend\Scripts\Activate.ps1
```

#### macOS / Linux

```bash
source .venv-django-backend/bin/activate
```

Install the required Python packages:

```bash
pip install Django==6.1.1
pip install djangorestframework==3.18.1
pip install django-cors-headers==4.9.0
```

## Running the Application

You need to open **two terminals**: one for the frontend and one for the backend.

### Terminal 1 — Frontend

From the project root:

```bash
cd frontend
npm run dev
```

### Terminal 2 — Backend

From the project root:

```bash
cd backend
```

If the virtual environment is not already active, activate it first.

#### Windows Command Prompt

```cmd
.venv-django-backend\Scripts\activate
```

#### Windows PowerShell

```powershell
.\.venv-django-backend\Scripts\Activate.ps1
```

#### macOS / Linux

```bash
source .venv-django-backend/bin/activate
```

Then start the Django development server:

```bash
python manage.py runserver
```

## Accessing the Application

After both servers are running:

- Open the frontend URL shown by `npm run dev` in your browser. (by default is `http://localhost:5173`)
- The Django backend will normally run at `http://localhost:8000`to access admin panel open this url `http://localhost:8000/admin`

## Stopping the Application

Press `Ctrl + C` in each terminal to stop the frontend and backend servers.

To leave the Python virtual environment, run:

```bash
deactivate
```
