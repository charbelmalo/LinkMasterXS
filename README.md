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

To see the emoji animation in action, click the button below:

<button id="emojiButton">Click me for emoji animation!</button>

<script>
   document.getElementById('emojiButton').addEventListener('click', (event) => {
      const emojis = ['😀', '😂', '😍', '😎', '🤔', '😜', '👍', '🎉'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      createEmoji(event.pageX, event.pageY, [randomEmoji]);
   });

   function createEmoji(x, y, emojiArray) {
      const gravity = 0;
      const friction = 0.99;
      
      for (let i = 0; i < 3; i++) {
         const ripple = document.createElement('div');
         ripple.style.position = 'absolute';
         ripple.style.left = x + 'px';
         ripple.style.top = y + 'px';
         ripple.style.width = '0px';
         ripple.style.height = '0px';
         ripple.style.opacity = '0';
         ripple.style.border = '2px solid rgba(255,255,255,'+0.05*(i/3)+')';
         ripple.style.borderRadius = '50%';
         ripple.style.transform = 'translate(-50%, -50%)';
         ripple.style.animation = `ripple 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`;
         document.body.appendChild(ripple);

         ripple.style.width = '50px';
         ripple.style.height = '50px';

         setTimeout(() => ripple.remove(), 500 + (i * 100));
      }

      for (let i = 0; i < emojiArray.length; i++) {
         setTimeout(() => {
            const emojiElement = document.createElement('span');
            emojiElement.innerText = emojiArray[i];
            emojiElement.style.position = 'absolute';
            emojiElement.style.fontSize = '48px';
            emojiElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            emojiElement.style.pointerEvents = 'none';
            document.body.appendChild(emojiElement);

            let scale = Math.random() * 0.7 + 0.3;
            let rotation = Math.random() * 360;
            let opacity = 1;
            let velX = (Math.random() - 0.5) * 40;
            let velY = (Math.random() - 0.5) * 40;

            function update() {
               velY += gravity;
               velX *= friction;
               velY *= friction;
               x += velX;
               y += velY;
               scale -= 0.03;
               rotation += 5;
               opacity -= 0.03;
               emojiElement.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`;
               emojiElement.style.opacity = opacity;
               if (opacity > 0) {
                  requestAnimationFrame(update);
               } else {
                  emojiElement.remove();
               }
            }
            update();
         }, i * 10);
      }

      if (!document.querySelector('#rippleAnimation')) {
         const style = document.createElement('style');
         style.id = 'rippleAnimation';
         style.textContent = `
            @keyframes ripple {
               0% {
                  transform: translate(-50%, -50%) scale(0);
                  opacity: 0;
               }
               5% {
                  opacity: 1;
               }
               100% {
                  transform: translate(-50%, -50%) scale(3);
                  opacity: 0;
               }
            }
         `;
         document.head.appendChild(style);
      }
   }
</script>
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