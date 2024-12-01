# README for Shortcuts App

## Overview

This project is a web-based application for managing and organizing shortcuts. It allows users to create, view, edit, and delete shortcuts, while also providing features like sorting, filtering, and tagging.

## Features

- **User Authentication**: Users can register, log in, and log out.
- **Shortcut Management**: Users can add, edit, and delete shortcuts.
- **Sorting and Filtering**: Shortcuts can be sorted alphabetically, by date added/updated, score, and favorited status. They can also be filtered by tags.
- **Tagging**: Shortcuts can be tagged hierarchically, making it easier to organize them.
- **Favoriting and Pinning**: Users can mark shortcuts as favorites and pin them at the top of the list.
- **Dynamic Favicon**: The favicon is dynamically generated based on the website's domain.
- **Emoji Animation**: When a shortcut is clicked, an animated emoji appears at the click location.
## Demo

Click the button below to see a random emoji animation:
```
<button id="emojiButton">Click me!</button>

<script>
   document.getElementById('emojiButton').addEventListener('click', function() {
      const emojis = ['😀', '😂', '😍', '🤔', '😎', '😢', '😡', '👍', '🎉', '💡'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const emojiElement = document.createElement('div');
      emojiElement.style.position = 'absolute';
      emojiElement.style.left = `${Math.random() * window.innerWidth}px`;
      emojiElement.style.top = `${Math.random() * window.innerHeight}px`;
      emojiElement.style.fontSize = '2rem';
      emojiElement.textContent = randomEmoji;
      document.body.appendChild(emojiElement);
      setTimeout(() => {
         emojiElement.remove();
      }, 1000);
   });
</script>
```
## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL (or SQLite for development)
- Node.js (for frontend dependencies)

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/shortcuts-app.git
   cd shortcuts-app
   ```

2. Set up virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to include your database URI and other necessary settings.

5. Initialize the database:
   ```bash
   flask db upgrade
   ```

6. Run the backend server:
   ```bash
   flask run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the frontend assets:
   ```bash
   npm run build
   ```

4. Copy the built assets to the static directory of the backend:
   ```bash
   cp -r dist/* ../backend/static/
   ```

## Usage

1. Access the application in your browser at `http://localhost:5000`.
2. Register or log in to manage your shortcuts.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to customize this README further to better fit your project's needs!