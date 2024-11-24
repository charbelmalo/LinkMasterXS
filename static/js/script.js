// document.addEventListener('DOMContentLoaded', () => {
//     // Element references
//     const searchInput = document.getElementById('searchInput');
//     const sortSelect = document.getElementById('sortSelect');
//     const selectedSort = document.getElementById('selectedSort');
//     const favoritedFirstCheckbox = document.getElementById('favoritedFirst');
//     const tagsToolbar = document.getElementById('tagsToolbar');
//     const linksGrid = document.getElementById('linksGrid');
//     const addLinkBtn = document.getElementById('addLinkBtn');
//     const linkModal = document.getElementById('linkModal');
//     const ContainerModal = document.getElementById('modal-container');
    
//     const closeModalBtn = document.getElementById('closeModal');
//     const linkForm = document.getElementById('linkForm');

//     // Form fields
//     const linkIdField = document.getElementById('linkId');
//     const linkNameField = document.getElementById('linkName');
//     const linkUrlField = document.getElementById('linkUrl');
//     const linkTagsField = document.getElementById('linkTags');
//     const linkEmojisField = document.getElementById('linkEmojis');
//     const colorFromField = document.getElementById('colorFrom');
//     const colorToField = document.getElementById('colorTo');
//     const shortDescriptionField = document.getElementById('shortDescription');
//     const scoreField = document.getElementById('score');
//     const pinnedField = document.getElementById('pinned');
//     const favoritedField = document.getElementById('favorited');
//     const saveLinkBtn = document.getElementById('saveLinkBtn');
    document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const selectedSort = document.getElementById('selectedSort');
    const favoritedFirstCheckbox = document.getElementById('favoritedFirst');
    const favFilterContainer = document.getElementById('favoritedFilterContainer');
    
    const favoritedIcon = document.getElementById('favoritedIcon');
    const tagsToolbar = document.getElementById('tagsToolbar');
    const linksGrid = document.getElementById('linksGrid');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkModal = document.getElementById('linkModal');
    const ContainerModal = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('closeModal');
    const linkForm = document.getElementById('linkForm');

    // Form fields
    const linkIdField = document.getElementById('linkId');
    const linkNameField = document.getElementById('linkName');
    const linkUrlField = document.getElementById('linkUrl');
    const linkTagsField = document.getElementById('linkTags');
    const linkEmojisField = document.getElementById('linkEmojis');
    const colorFromField = document.getElementById('colorFrom');
    const colorToField = document.getElementById('colorTo');
    const shortDescriptionField = document.getElementById('shortDescription');
    const scoreField = document.getElementById('score');
    const pinnedField = document.getElementById('pinned');
    const favoritedField = document.getElementById('favorited');
    const saveLinkBtn = document.getElementById('saveLinkBtn');

    let allShortcuts = [];
    let currentTags = [];
    let isCmdPressed = false; // Track if cmd/ctrl key is pressed

    // Fetch and display shortcuts
    function fetchShortcuts() {
        let params = new URLSearchParams();
        params.append('search', searchInput.value);
        params.append('sort_by', sortSelect.value);
        params.append('favorited_first', favoritedFirstCheckbox.checked);
        currentTags.forEach(tag => params.append('tags', tag));

        fetch(`/api/shortcuts?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                allShortcuts = data;
                displayShortcuts(data);
                populateTagsToolbar();
            })
            .catch(error => console.error('Error fetching shortcuts:', error));
    }

    // Display shortcuts in the grid
    function displayShortcuts(shortcuts) {
        linksGrid.innerHTML = '';

        shortcuts.forEach(shortcut => {
            // Create the <article> element
            const article = document.createElement('article');

            // Create the link card container
            const linkCard = document.createElement('a');
            linkCard.href = shortcut.link;
            linkCard.target = '_blank';
            linkCard.className = 'relative z-0 mx-auto flex flex-col items-center justify-center bg-gradient-to-br p-4 filter overflow-hidden hover:brightness-110 h-40 rounded-lg';
            linkCard.style.backgroundImage = `linear-gradient(to bottom right, ${shortcut.color_from}, ${shortcut.color_to})`;

            // Add gradient overlay
            const gradientOverlay = document.createElement('div');
            gradientOverlay.className = 'absolute left-0 top-0 h-24 w-1/2 bg-gradient-to-br from-black/20 via-transparent to-transparent';
            linkCard.appendChild(gradientOverlay);

            // Status badge (e.g., "Shortcut")
            const statusBadgeContainer = document.createElement('div');
            statusBadgeContainer.className = 'absolute right-16 flex flex-wrap content-start gap-1 overflow-hidden top-3 left-3 text-xs';
            const statusBadge = document.createElement('div');
            statusBadge.className = 'inline-flex cursor-pointer select-none items-center overflow-hidden font-mono inline-flex items-center rounded border !border-white/5 bg-white/10 leading-tight text-white opacity-80';
            const statusBadgeContent = document.createElement('div');
            statusBadgeContent.className = 'inline-flex items-center px-1 py-0';
            statusBadgeContent.textContent = 'Shortcut';
            statusBadge.appendChild(statusBadgeContent);
            statusBadgeContainer.appendChild(statusBadge);
            linkCard.appendChild(statusBadgeContainer);

            // Icon and count container (e.g., score)
            if (shortcut.score !== undefined && shortcut.score !== null && shortcut.score !== 0) {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'absolute flex px-2 items-center rounded-xl top-2.5 right-4 text-xs inline-flex cursor-pointer select-none items-center overflow-hidden font-mono inline-flex items-center rounded border !border-white/5 bg-white/10 leading-tight text-white opacity-80';
                const icon = document.createElement('i');
                icon.className = 'fa fa-xs fa-star text-white mr-1';
                // Add SVG path here if needed
                // icon.innerHTML = '<path d="M16 2L12.5 12H2l8.5 6L7 28l9-6.5L25 28l-3.5-10L30 12h-10.5L16 2z"></path>';
                iconContainer.appendChild(icon);

                const countSpan = document.createElement('span');
                countSpan.className = 'text-white font-bold';
                countSpan.textContent = shortcut.score;
                iconContainer.appendChild(countSpan);
                linkCard.appendChild(iconContainer);
            }

            // Emoji overlay
            const emojiDiv = document.createElement('div');
            emojiDiv.className = 'absolute opacity-60 text-6xl mb-1 drop-shadow-xl';
            emojiDiv.textContent = shortcut.emojis || '🔗';
            linkCard.appendChild(emojiDiv);

            // Card Title (name)
            const nameDiv = document.createElement('h4');
            nameDiv.className = 'z-40 max-w-full truncate text-center font-bold leading-tight text-blue-50 text-xl';
            nameDiv.style.textShadow = '0px 1px 2px rgba(0, 0, 0, 0.25)';
            nameDiv.textContent = shortcut.name;
            linkCard.appendChild(nameDiv);

            // Short description (if present)
            if (shortcut.short_description) {
                const descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'absolute bottom-0 right-0 z-40 flex max-w-[93%] items-center';
                const svgOverlay = document.createElement('svg');
                svgOverlay.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                svgOverlay.className = 'pointer-events-none absolute left-0 h-full -translate-x-full text-black/15';
                svgOverlay.setAttribute('viewBox', '0 0 16 12');
                const svgPath = document.createElement('path');
                svgPath.setAttribute('fill', 'currentColor');
                svgPath.setAttribute('d', 'M9.49 6.13C8.07 10.7 6.09 12 0 12h16V0c-3.5 0-4.97 1.2-6.51 6.13Z');
                svgOverlay.appendChild(svgPath);
                descriptionDiv.appendChild(svgOverlay);

                const descriptionText = document.createElement('p');
                descriptionText.className = 'truncate break-words bg-black/15 py-0.5 pl-2 pr-2 text-[0.78rem] rounded-tl-lg leading-tight text-white/90';
                descriptionText.textContent = shortcut.short_description;
                descriptionDiv.appendChild(descriptionText);

                linkCard.appendChild(descriptionDiv);
            }

            // Trash icon for deletion
            const trashIcon = document.createElement('i');
            trashIcon.className = 'fas fa-trash-alt absolute top-2 right-2 text-gray-500 opacity-0 transition-opacity duration-200';
            linkCard.appendChild(trashIcon);

            // Event listener for cmd/ctrl key and hover
            linkCard.addEventListener('mouseenter', () => {
                if (isCmdPressed) {
                    trashIcon.classList.remove('opacity-0');
                }
            });
            linkCard.addEventListener('mouseleave', () => {
                trashIcon.classList.add('opacity-0');
            });
            trashIcon.addEventListener('click', (e) => {
                e.preventDefault();
                deleteShortcut(shortcut.id);
            });

            // Append the linkCard to the article
            article.appendChild(linkCard);

            // Card footer
            const footer = document.createElement('header');
            footer.className = 'mt-1 flex items-center overflow-hidden';

            // Extract domain from URL
            const domain = extractDomain(shortcut.link);

            // Domain display
            const domainLi = document.createElement('li');
            domainLi.className = 'group relative flex items-center whitespace-nowrap';
            const domainSpan = document.createElement('span');
            domainSpan.className = 'flex items-center gap-2';
            
            // Create the favicon image
            const faviconImg = document.createElement('img');
            faviconImg.className = 'w-4 h-4 rounded-sm'; // Tailwind classes for width, height, and border radius
            // Alternatively, if not using Tailwind, use:
            // faviconImg.style.width = '16px';
            // faviconImg.style.height = '16px';
            // faviconImg.style.borderRadius = '2px';

            // Set the favicon source using Google's Favicon Service
            // faviconImg.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}`;
            faviconImg.src = `https://${encodeURIComponent(domain)}/favicon.ico`;
                        
            // const faviconSize = 64; // You can adjust this size as needed (e.g., 32, 64, 128)
            // faviconImg.src = `https://api.faviconkit.com/${encodeURIComponent(domain)}/64`;



            // Handle image loading errors by providing a fallback icon (optional)
            faviconImg.onerror = () => {
                // You can set a default fallback icon here if the favicon fails to load
                // For example, using a default SVG or a placeholder image
                faviconImg.src = '/static/default/favicon.svg'; // Replace with your fallback image path
            };

            // Create the domain text
            const domainText = document.createElement('span');
            domainText.textContent = domain;

            // Append the favicon and text to the span
            domainSpan.appendChild(faviconImg);
            domainSpan.appendChild(domainText);

            // Append the span to the list item
            domainLi.appendChild(domainSpan);

            footer.appendChild(domainLi);

            // Append the footer to the article
            article.appendChild(footer);

            // Append the article to the grid
            linksGrid.appendChild(article);
        });
    }

    // Helper function to extract domain from URL
    function extractDomain(url) {
        try {
            const hostname = new URL(url).hostname;
            return hostname.replace('www.', '');
        } catch (e) {
            return url;
        }
    }

    // Event listeners for cmd/ctrl key
    window.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey) {
            isCmdPressed = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!e.metaKey && !e.ctrlKey) {
            isCmdPressed = false;
        }
    });

    // Toggle favorite status using the icon
    favFilterContainer.addEventListener('click', () => {
        favoritedFirstCheckbox.checked = !favoritedFirstCheckbox.checked;
        favoritedIcon.classList.toggle('text-yellow-500', favoritedFirstCheckbox.checked);
        fetchShortcuts();
    });

// Helper function to format time ago
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.round((now - date) / 1000); // difference in seconds

    if (diff < 60) {
        return 'just now';
    } else if (diff < 3600) {
        const mins = Math.floor(diff / 60);
        return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diff < 2592000) {
        const days = Math.floor(diff / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
        return new Date(dateString).toLocaleDateString();
    }
}
    // Populate tags toolbar
    function populateTagsToolbar() {
        const tagsSet = new Set();
        allShortcuts.forEach(shortcut => {
            shortcut.tags.forEach(tag => tagsSet.add(tag));
        });

        tagsToolbar.innerHTML = '';
        tagsSet.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.className = 'tag tag-white text-xs mr-1 tag-button font-bold justify-center gap-2 rounded-full border px-3 py-1 max-sm:text-sm sm:px-4 sm:py-1.5 cursor-pointer transition-all duration-200';
            tagButton.textContent = tag;
            tagButton.addEventListener('click', () => toggleTagFilter(tag));
            if (currentTags.includes(tag)) {
                
                tagButton.classList.remove('tag-white');
          

                tagButton.classList.add('from-blue-500');
                tagButton.classList.add('dark:to-blue-500');
                tagButton.classList.add('text-white');
                tagButton.classList.add('dark:from-blue-500');
            }
            else {
                
            }
            tagsToolbar.appendChild(tagButton);
        });
    }

    function toggleTagFilter(tag) {
        if (currentTags.includes(tag)) {
            currentTags = currentTags.filter(t => t !== tag);
        } else {
            currentTags.push(tag);
        }
        fetchShortcuts();
    }

    // Toggle favorite status
    function toggleFavorite(id, favorited) {
        fetch(`/api/shortcuts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorited })
        })
            .then(response => {
                if (response.ok) {
                    fetchShortcuts();
                } else {
                    console.error('Failed to update favorite status');
                }
            })
            .catch(error => console.error('Error updating favorite status:', error));
    }

    // Delete shortcut
    function deleteShortcut(id) {
        if (confirm('Are you sure you want to delete this link shortcut?')) {
            fetch(`/api/shortcuts/${id}`, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        fetchShortcuts();
                    } else {
                        console.error('Failed to delete shortcut');
                    }
                })
                .catch(error => console.error('Error deleting shortcut:', error));
        }
    }

    // Open modal for adding/editing
    function openModal(title, shortcut = null) {
        document.getElementById('modalTitle').textContent = title;
        linkForm.reset();
        if (shortcut) {
            linkIdField.value = shortcut.id;
            linkNameField.value = shortcut.name;
            linkUrlField.value = shortcut.link;
            linkTagsField.value = shortcut.tags.join(', ');
            linkEmojisField.value = shortcut.emojis;
            colorFromField.value = rgbToHex(shortcut.color_from);
            colorToField.value = rgbToHex(shortcut.color_to);
            shortDescriptionField.value = shortcut.short_description;
            scoreField.value = shortcut.score;
            pinnedField.checked = shortcut.pinned;
            favoritedField.checked = shortcut.favorited;
        } else {
            linkIdField.value = '';
        }
        ContainerModal.style.display = 'block';
    }

    // Close modal
    function closeModal() {
        ContainerModal.style.display = 'none';
    }

    // Convert RGBA to HEX
    function rgbToHex(rgba) {
        const rgb = rgba.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        return `#${((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1)}`;
    }

    // Convert HEX to RGBA
    function hexToRgba(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    // Event listeners
    searchInput.addEventListener('input', fetchShortcuts);
    // selectedSort.addEventListener('click', fetchShortcuts);

    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', fetchShortcuts);
    });
    favoritedFirstCheckbox.addEventListener('change', fetchShortcuts);

    addLinkBtn.addEventListener('click', () => openModal('Add Link Shortcut'));
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === ContainerModal) {
            closeModal();
        }
    });

    linkForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const id = linkIdField.value;
        const shortcut = {
            name: linkNameField.value.trim(),
            link: linkUrlField.value.trim(),
            tags: linkTagsField.value.trim().split(',').map(tag => tag.trim()).filter(tag => tag),
            emojis: linkEmojisField.value.trim(),
            color_from: hexToRgba(colorFromField.value),
            color_to: hexToRgba(colorToField.value),
            short_description: shortDescriptionField.value.trim(),
            score: parseFloat(scoreField.value) || 0.0,
            pinned: pinnedField.checked,
            favorited: favoritedField.checked
        };

        const url = id ? `/api/shortcuts/${id}` : '/api/shortcuts';
        const method = id ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shortcut)
        })
            .then(response => {
                if (response.ok) {
                    closeModal();
                    fetchShortcuts();
                } else {
                    console.error('Failed to save shortcut');
                }
            })
            .catch(error => console.error('Error saving shortcut:', error));
    });

    // Initial fetch
    fetchShortcuts();
});