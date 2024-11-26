document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const selectedSort = document.getElementById('selectedSort');
    const favoritedFirstCheckbox = document.getElementById('favoritedFirst');
    const favFilterContainer = document.getElementById('favoritedFilterContainer');
    const favoritedIcon = document.getElementById('favoritedIcon');
    const favoritedText = document.getElementById('favoritedText');
    const tagsToolbar = document.getElementById('tagsToolbar');
    const linksGrid = document.getElementById('linksGrid');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkModal = document.getElementById('linkModal');
    const ContainerModal = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('closeModal');
    const linkForm = document.getElementById('linkForm');
    let selectedTags = []; // Keep track of selected tags

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

    let isCmdPressed = false; // Track if cmd/ctrl key is pressed

    // Sort dropdown functionality
    const sortButton = document.getElementById('sortButton');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortsSelect = document.getElementById('sortSelect');

    const linkTagsInput = document.getElementById('linkTags');
    const tagsDropdown = document.getElementById('tagsDropdown');

      // Event listener for linkTagsInput (Autocomplete)
      linkTagsInput.addEventListener('input', () => {
        const query = linkTagsInput.value.trim().split(/[,>]/).pop().trim();
        if (query.length === 0) {
            tagsDropdown.classList.add('hidden');
            return;
        }
        // Fetch existing tags from the server
        fetch(`/api/tags?search=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(tags => {
                renderTagsDropdown(tags);
            });
    });


    // Event listener to hide tagsDropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!linkTagsInput.contains(e.target) && !tagsDropdown.contains(e.target)) {
            tagsDropdown.classList.add('hidden');
        }
    });

    sortButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sortDropdown.classList.toggle('hidden');
    });

    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectedSort.textContent = e.target.textContent;
            sortsSelect.value = e.target.dataset.value;
            sortDropdown.classList.add('hidden');
            fetchShortcuts(); // Refresh the shortcuts based on new sort
        });
    });

    document.addEventListener('click', (e) => {
        if (!sortButton.contains(e.target) && !sortDropdown.contains(e.target)) {
            sortDropdown.classList.add('hidden');
        }
    });

    // Fetch shortcuts from the API
    function fetchShortcuts() {
        const searchQuery = searchInput.value.toLowerCase();
        
        const selectedTags = Array.from(document.querySelectorAll('#tagsToolbar input:checked')).map(input => input.value);

        const searchParams = new URLSearchParams();
        searchParams.set('search', searchQuery);
        searchParams.set('sort_by', sortSelect.value);
        searchParams.set('favorited_first', favoritedFirstCheckbox.checked);
        selectedTags.forEach(tag => searchParams.append('tags', tag));

        fetch(`/api/shortcuts?${searchParams.toString()}`)
            .then(response => response.json())
            .then(data => {
                displayShortcuts(data);
            });
    }

    // Display shortcuts in the grid
    function displayShortcuts(shortcuts) {
        // Clear the grid with a fade-out effect
        linksGrid.querySelectorAll('article').forEach(article => {
            article.classList.add('opacity-0', 'transition-all', 'duration-200');
            setTimeout(() => {
                article.remove();
            }, 200);
        });

        // Delay adding new items to allow the fade-out to complete
        setTimeout(() => {
            shortcuts.forEach(shortcut => {
                // Create the <article> element
                const article = document.createElement('article');
                const averageLuminance = calculateAverageLuminance(shortcut.color_from, shortcut.color_to);
                const textColor = 'text-white';
                const overlayStrength = averageLuminance > 0.5 ? 'luminanceneg' : 'luminancepos' ;
                article.className = 'transition-all duration-200 opacity-1';

                // Create the link card container
                const linkCard = document.createElement('a');
                linkCard.href = shortcut.link;
                linkCard.target = '_blank';
                linkCard.setAttribute('aria-label', 'Visit ' + shortcut.name);
                linkCard.className = `link-card ${overlayStrength} relative z-0 mx-auto flex flex-col items-center justify-center bg-gradient-to-br p-4 filter overflow-hidden brightness-120 transition-all duration-200 h-40 rounded-lg`;
                linkCard.style.backgroundImage = `linear-gradient(to bottom right, ${shortcut.color_from}, ${shortcut.color_to})`;

                // Add gradient overlay
                const gradientOverlay = document.createElement('div');
                gradientOverlay.className = averageLuminance < 0.9 ?  'absolute left-0 top-0 h-full w-full  bg-gradient-to-br from-white/10 to-black/10' : 'absolute left-0 top-0 h-full w-full  bg-gradient-to-b from-white/10 to-black/50';
                linkCard.appendChild(gradientOverlay);

               
                // Status badge (e.g., "Shortcut")
                const statusBadgeContainer = document.createElement('div');
                statusBadgeContainer.className = 'absolute hidden opacity-0 right-16 flex flex-wrap content-start gap-1 overflow-hidden top-3 left-3 text-xs  transition-opacity duration-200';
                const statusBadge = document.createElement('div');
                statusBadge.className = `inline-flex cursor-pointer select-none items-center overflow-hidden font-mono rounded bg-white/20 leading-tight text-white opacity-80`;
                const statusBadgeContent = document.createElement('div');
                statusBadgeContent.className = 'inline-flex items-center px-1 py-0 ';
                statusBadgeContent.textContent = 'Shortcut';
                statusBadge.appendChild(statusBadgeContent);
                statusBadgeContainer.appendChild(statusBadge);
                linkCard.appendChild(statusBadgeContainer);

                const iconContainer = document.createElement('div');
                iconContainer.className = 'absolute hidden opacity-0 flex px-1 items-center rounded-xl top-2.5 right-4 text-xs  cursor-pointer select-none items-center overflow-hidden font-mono rounded bg-white/20  text-white  transition-opacity duration-200';
                    // Icon and count container (e.g., score)
                if (shortcut.score !== undefined && shortcut.score !== null && shortcut.score !== 0) {
                    const icon = document.createElement('i');
                    icon.className = 'fa fa-xs fa-star text-white mr-1';
                    iconContainer.appendChild(icon);

                    const countSpan = document.createElement('span');
                    countSpan.className = 'text-white font-bold text-xs ';
                    countSpan.textContent = shortcut.score;
                    iconContainer.appendChild(countSpan);
                    linkCard.appendChild(iconContainer);
                }

                // Emoji overlay container
                const emojiContainer = document.createElement('div');
                emojiContainer.className = 'absolute text-center flex items-center justify-center -mt-1 opacity-80 transition-opacity duration-200';
                emojiContainer.style.height = '60px';
                emojiContainer.style.width = '-webkit-fill-available';

                // Blurred emoji background
                const blurContainer = document.createElement('div');
                blurContainer.style.position = 'absolute';
                blurContainer.style.height = '0';
                blurContainer.style.width = '0px';

                const blurredEmoji = document.createElement('div');
                blurredEmoji.className = 'emoji inline absolute opacity-100 blur-100 text-6xl mb-1 transition-transform duration-200';
                blurredEmoji.style.mixBlendMode = 'normal';
                blurredEmoji.style.filter = 'blur(35px)';
                blurredEmoji.textContent = shortcut.emojis || '🔗';
                blurContainer.appendChild(blurredEmoji);

                // Main emoji
                const emojiSpan = document.createElement('div');
                emojiSpan.className = 'emoji  inline absolute opacity-100 text-6xl mb-1 transition-transform duration-200';
                emojiSpan.textContent = shortcut.emojis || '🔗';

                // Assemble the structure
                emojiContainer.appendChild(blurredEmoji);
                emojiContainer.appendChild(emojiSpan);
                linkCard.appendChild(emojiContainer);

                // Card Title (name)
                const nameDiv = document.createElement('h4');
                nameDiv.className = `card-title z-40 overflow-visible p-5 max-w-full mt-1 truncate text-center font-bold leading-tight  ${textColor} text-2xl transition-transform duration-200`;
                nameDiv.style.textShadow = '0px 1px 2px rgba(0, 0, 0, 0.25)';
                nameDiv.textContent = shortcut.name;
                linkCard.appendChild(nameDiv);

                // Short description (if present)
                if (shortcut.short_description) {
                    const descriptionDiv = document.createElement('div');
                   
                    const svgDecor = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="pointer-events-none absolute left-0 h-full -translate-x-full text-black/15" viewBox="0 0 16 12"><path fill="currentColor" d="M9.49 6.13C8.07 10.7 6.09 12 0 12h16V0c-3.5 0-4.97 1.2-6.51 6.13Z"></path></svg>`
                   
                    descriptionDiv.innerHTML= svgDecor;
                    const descriptionText = document.createElement('p');
                    const descriptionSpan = document.createElement('span');
                    descriptionText.className = `bg-black/15 transition-all duration-200 leading-tight `;
                    descriptionSpan.className = `truncate break-words py-0.5 pr-2 text-[0.78rem] -ml-1 ${textColor}`;
                    descriptionSpan.textContent = shortcut.short_description;
                    descriptionText.appendChild(descriptionSpan);
                    descriptionDiv.appendChild(descriptionText);

                    descriptionDiv.className = 'absolute bottom-0 right-0 z-40 flex max-w-[83%] items-center';
      
                    linkCard.appendChild(descriptionDiv);
                }

                // Trash icon for deletion
                const trashIcon = document.createElement('i');
                trashIcon.className = 'trash-icon fa fa-solid fa-trash absolute top-2 right-2 text-gray-900 opacity-0 transition-opacity duration-200';
                linkCard.appendChild(trashIcon);

                // Event listener for hover
                linkCard.addEventListener('mouseenter', () => {
                    if (isCmdPressed) {
                        trashIcon.classList.remove('opacity-0');
                    }
                    statusBadgeContainer.classList.remove('hidden');
                    iconContainer.classList.remove('hidden');
                    iconContainer.classList.remove('opacity-0');
                    statusBadgeContainer.classList.remove('opacity-0');
                    iconContainer.classList.add('opacity-80');
                    statusBadgeContainer.classList.add('opacity-100');
                    emojiContainer.classList.add('opacity-100');

                });

                linkCard.addEventListener('mouseleave', () => {
                    if (isCmdPressed) {
                        trashIcon.classList.add('opacity-0');
                    }
                    iconContainer.classList.add('opacity-0');
                    statusBadgeContainer.classList.add('opacity-0');
                    iconContainer.classList.remove('opacity-80');
                    statusBadgeContainer.classList.remove('opacity-100');
                    emojiContainer.classList.remove('opacity-100');
                    setTimeout(() => {
                        statusBadgeContainer.classList.add('hidden');
                        iconContainer.classList.add('hidden');
                    }, 200);
                });

                // Update trash icon visibility on keydown and keyup
                window.addEventListener('keydown', (e) => {
                    if (e.metaKey || e.ctrlKey) {
                        isCmdPressed = true;
                        if (linkCard.matches(':hover')) {
                            trashIcon.classList.remove('opacity-0');
                        }
                    }
                });

                window.addEventListener('keyup', (e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                        isCmdPressed = false;
                        trashIcon.classList.add('opacity-0');
                    }
                });

                trashIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    deleteShortcut(shortcut.id);
                });

                // Click event for emoji animation and navigation
                linkCard.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent immediate navigation
                    const emojis = linkCard.querySelectorAll('.emoji')[0].innerHTML;
                    // console.log(emojis);
                    // const emojiArray = emojis.split(''); // Split emojis into an array
                    const splitEmoji = (string) => [...new Intl.Segmenter().segment(string)].map(x => x.segment)
                    // console.log(splitEmoji(emojis));
                    const count = 15;
                    for (let i = 0; i < count; i++) {
                        const x = event.pageX;
                        const y = event.pageY;
                        createEmoji(x, y, splitEmoji(emojis));
                    }
                    // Navigate to the link after a short delay
                    setTimeout(() => {
                        window.open(shortcut.link, '_blank');
                    }, 500); // Adjust delay as needed
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
                domainSpan.className = 'flex items-center gap-2 text-gray-900 text-xs font-mono mt-1';

                // Create the favicon image
                const faviconImg = document.createElement('img');
                faviconImg.onload = function() {
                    const favLuminance = getImageLuminance(faviconImg);
                    console.log*('loaded ${domain} favicon with luminance ${favLuminance}');
                    if (favLuminance < 0.2) {
                        faviconImg.classList.remove = 'dark:from-gray-900','to-transparent';
                        faviconImg.classList.add = 'dark:from-gray-100','dark:to-white';
                    } else {
                        faviconImg.style.backgroundColor = 'white';
                    }
                };
                faviconImg.src = `https://${encodeURIComponent(domain)}/favicon.ico`;
                faviconImg.className = 'w-6 h-6 rounded-md bg-gradient-to-tr from-gray-300 dark:from-gray-900 to-transparent hover:to-gray-700 p-1';
               
                // Handle image loading errors by providing a fallback icon
                faviconImg.onerror = () => {
                    faviconImg.src = 'static/default/favicon.svg';
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

                // Trigger reflow to enable the transition
                void article.offsetWidth;

                // Remove opacity-0 to start fade-in effect
                article.classList.remove('opacity-0');
            });
        }, 200); // Match this delay with the duration of fade-out
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

    // Emoji animation function
    function createEmoji(x, y, emojiArray) {
        const gravity = 0.1;
        const friction = 0.99;
        
        console.log(emojiArray);
        // const emojiElementCont = document.createElement('div');
        const emojiElement = document.createElement('span');
        emojiElement.innerText = emojiArray[Math.floor(Math.random() * emojiArray.length)];
        emojiElement.style.position = 'absolute';
        emojiElement.style.fontSize = '48px';
        emojiElement.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        emojiElement.style.pointerEvents = 'none';
        // emojiElementCont.appendChild(emojiElement);
        document.body.appendChild(emojiElement);
        let scale = Math.random() * 1.5;
        let rotation = Math.random() * 360;
        let opacity = 1;
        let velX = (Math.random() - 0.5) * 20;
        let velY = (Math.random() - 0.5) * 20;
        function update() {
            velY += gravity;
            velX *= friction;
            velY *= friction;
            x += velX;
            y += velY;
            scale -= 0.02;
            rotation += 10;
            opacity -= 0.01;
            emojiElement.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`;
            emojiElement.style.opacity = opacity;
            if (opacity > 0) {
                requestAnimationFrame(update);
            } else {
                emojiElement.remove();
            }
        }
        update();
    }

      // Fetch and render tags for the tags toolbar
      function fetchTags() {
        fetch('/api/tags')
            .then(response => response.json())
            .then(tags => {
                renderTags(tags);
            });
    }

    // Update tagsToolbar rendering
    function renderTags(tagsData) {
        const tagsToolbar = document.getElementById('tagsToolbar');
        tagsToolbar.innerHTML = '';
        tagsData.forEach(tag => {
            const tagContainer = document.createElement('div');
            tagContainer.classList.add('flex', 'flex-shrink-0');

            const tagLabel = document.createElement('label');
            tagLabel.classList.add('flex', 'bg-gradient-to-br','hover:opacity-100' ,'rounded-lg', 'from-gray-300','to-transparent', 'items-center', 'gap-1', 'px-2', 'py-2', 'cursor-pointer', 'transition-all', 'duration-200');
           
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('hidden');
            checkbox.value = tag.name;
            checkbox.checked = selectedTags.includes(tag.name);
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                     tagLabel.classList.remove('opacity-30');
           
                    selectedTags.push(tag.name);
                } else {
                    selectedTags = selectedTags.filter(t => t !== tag.name);
                    tagLabel.classList.add('opacity-30');
                }
                fetchShortcuts();
                renderTags(tagsData); // Re-render tags to update styles
            });

            // Determine classes based on checkbox state
            if (checkbox.checked) {
                tagLabel.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-blue-900', 'text-white');
                tagLabel.classList.remove('opacity-30');
            } else {
                tagLabel.classList.add('dark:from-gray-800', 'dark:text-white');
                // tagLabel.classList.add('opacity-30');

            }

            const tagSpan = document.createElement('span');
            tagSpan.className = 'text-xs font-mono cursor-pointer';
            tagSpan.textContent = `${tag.name} `;

            const tagCount = document.createElement('span');
            tagCount.className = 'px-2 items-center rounded-xl text-xs text-gray-100 font-bold inline-flex cursor-pointer select-none items-center overflow-hidden font-mono rounded bg-white/10 leading-tight opacity-80 hover:opacity-30 transition-opacity duration-200';
            tagCount.textContent = `${tag.count} `;

            tagLabel.appendChild(checkbox);
            tagLabel.appendChild(tagSpan);
            tagLabel.appendChild(tagCount);
            tagContainer.appendChild(tagLabel);
            tagsToolbar.appendChild(tagContainer);
        });
    }

    // Render tags autocomplete dropdown
    function renderTagsDropdown(tags) {
        tagsDropdown.innerHTML = '';
        if (tags.length === 0) {
            tagsDropdown.classList.add('hidden');
            return;
        }
        tags.forEach(tag => {
            const tagOption = document.createElement('div');
            tagOption.className = 'px-4 py-2 cursor-pointer hover:bg-gray-100';
            tagOption.textContent = tag.name;
            tagOption.addEventListener('click', () => {
                let currentTags = linkTagsInput.value.split(/[,>]/).map(t => t.trim());
                currentTags[currentTags.length - 1] = tag.name;
                linkTagsInput.value = currentTags.join(', ');
                tagsDropdown.classList.add('hidden');
                linkTagsInput.focus();
            });
            tagsDropdown.appendChild(tagOption);
        });
        tagsDropdown.classList.remove('hidden');
    }

    

    // Event listener for cmd/ctrl key
    window.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey) {
            isCmdPressed = true;
            // Show trash icons on currently hovered cards
            document.querySelectorAll('.link-card:hover .trash-icon').forEach(icon => {
                icon.classList.remove('opacity-0');
            });
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!e.metaKey && !e.ctrlKey) {
            isCmdPressed = false;
            // Hide all trash icons
            document.querySelectorAll('.trash-icon').forEach(icon => {
                icon.classList.add('opacity-0');
            });
        }
    });

    // Toggle favorite status using the icon
    favFilterContainer.addEventListener('click', (e) => {

        e.preventDefault();
        favoritedFirstCheckbox.checked = !favoritedFirstCheckbox.checked;
        if (favoritedFirstCheckbox.checked) {
            favoritedIcon.classList.remove('fa-heart-o', 'text-red-700');
            favoritedIcon.classList.add('fa-heart', 'text-white');
            // favFilterContainer.classList.remove('bg-gradient-to-br', 'from-red-100', 'to-white', 'dark:from-red-50', 'dark:to-red-100');
            favFilterContainer.classList.add('bg-red-500');
            favoritedText.classList.remove('text-red-700');
            favoritedText.classList.add('text-white');
        } else {
            favoritedIcon.classList.remove('fa-heart', 'text-white');
            favoritedIcon.classList.add('fa-heart-o', 'text-red-700');
            favFilterContainer.classList.remove('bg-red-500');
            // favFilterContainer.classList.add('bg-gradient-to-br', 'from-red-100', 'to-white', 'dark:from-red-50', 'dark:to-red-100');
            favoritedText.classList.remove('text-white');
            favoritedText.classList.add('text-red-700');
        }
        fetchShortcuts();
    });

    // Open modal for adding/editing
    addLinkBtn.addEventListener('click', () => openModal('Add Link Shortcut'));

    // Close modal
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


    function getImageLuminance(img) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        const imageData = context.getImageData(0, 0, img.width, img.height).data;
        let totalLuminance = 0;
        let pixelCount = 0;
        for (let i = 0; i < imageData.length; i += 4) {
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += luminance;
            pixelCount++;
        }
        return (totalLuminance / pixelCount) / 255;
    }

    // Convert HEX to RGBA
    function hexToRgba(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    // Close modal function
    function closeModal() {
        ContainerModal.classList.add('hidden');
    }

    // Open modal function
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
        ContainerModal.classList.remove('hidden');
    }
      // Function to calculate average luminance of two colors
      function calculateAverageLuminance(color1, color2) {
        const luminance1 = getLuminance(color1);
        const luminance2 = getLuminance(color2);
        return (luminance1 + luminance2) / 2;
    }

    // Function to calculate luminance of a color
    function getLuminance(rgba) {
        const rgb = rgba.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        const r = parseInt(rgb[0]) / 255;
        const g = parseInt(rgb[1]) / 255;
        const b = parseInt(rgb[2]) / 255;
        // Use the luminance formula
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Convert RGBA to HEX
    function rgbToHex(rgba) {
        const rgb = rgba.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        return `#${((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1)}`;
    }

    
        // Event listeners
        searchInput.addEventListener('input', fetchShortcuts);
        // selectedSort.addEventListener('click', fetchShortcuts);
    
       
    // Fetch initial data
    fetchShortcuts();
    fetchTags();

    // Enable dragging to scroll on tagsToolbar
    let isDragging = false;
    let startX;
    let scrollLeft;

    tagsToolbar.addEventListener('mousedown', (e) => {
        isDragging = true;
        tagsToolbar.classList.add('dragging');
        startX = e.pageX - tagsToolbar.offsetLeft;
        scrollLeft = tagsToolbar.scrollLeft;
    });

    tagsToolbar.addEventListener('mouseleave', () => {
        isDragging = false;
        tagsToolbar.classList.remove('dragging');
    });

    tagsToolbar.addEventListener('mouseup', () => {
        isDragging = false;
        tagsToolbar.classList.remove('dragging');
    });

    tagsToolbar.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - tagsToolbar.offsetLeft;
        const walk = (x - startX) * 1; // Adjust scroll speed
        tagsToolbar.scrollLeft = scrollLeft - walk;
    });
});
