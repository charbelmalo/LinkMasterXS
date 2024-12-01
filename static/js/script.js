let isCmdPressed = false;

// Global key event listeners
document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey) {
        isCmdPressed = true;
        document.querySelectorAll('.link-card:hover .action-items-container').forEach(container => {
            container.classList.remove('opacity-0');
        });
    }
});

document.addEventListener('keyup', (e) => {
    if (!e.metaKey && !e.ctrlKey) {
        isCmdPressed = false;
        document.querySelectorAll('.action-items-container').forEach(container => {
            container.classList.add('opacity-0');
        });
    }
});


document.addEventListener('DOMContentLoaded', () => {
    // Element references
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const selectedSort = document.getElementById('selectedSort');
    const favoritedFirstCheckbox = document.getElementById('favoritedFirst');
    const favFilterContainer = document.getElementById('favoritedFilterContainer');
    const favoritedIcon = document.getElementById('favoritedIcon');
    const favoritedText = document.getElementById('favoritedText');
    const tagsToolbar = document.getElementById('tagsTree');
    const linksGrid = document.getElementById('linksGrid');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkModal = document.getElementById('linkModal');
    const ContainerModal = document.getElementById('modal-container');
    const closeModalBtn = document.getElementById('closeModal');
    const linkForm = document.getElementById('linkForm');
    let selectedTags = []; // Keep track of selected tags

 

    function debounce(func, delay) {
        let debounceTimer;
        return function() {
          const context = this;
          const args = arguments;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
      }

      
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


    containerModal = document.getElementById('modal-container');


    // Sort dropdown functionality
    const sortButton = document.getElementById('sortButton');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortsSelect = document.getElementById('sortSelect');

    const linkTagsInput = document.getElementById('linkTags');
    const tagsDropdown = document.getElementById('tagsDropdown');

    // Function to determine theme preference
    function getThemePreference() {
        // Check if the user has set a specific preference in the browser
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const prefersLightScheme = window.matchMedia("(prefers-color-scheme: light)").matches;

        // Here, you can define how to detect "automatic" if applicable.
        // For simplicity, we'll assume if neither dark nor light is explicitly set, it's automatic.
        let theme = 'automatic';

        if (prefersDarkScheme) {
            theme = 'dark';
        } else if (prefersLightScheme) {
            theme = 'light';
        }

        // If theme is automatic, determine OS-level preference (this is similar to what browsers do)
        if (theme === 'automatic') {
            // You might have additional logic here. For this example, we'll default to light.
            // Alternatively, you can perform more complex checks or ask the user.
            // Here, we'll re-check the OS preference
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                theme = 'dark';
            } else {
                theme = 'light';
            }
        }

        return theme;
    }

    // Send the theme to the server
    function sendThemeToServer(theme) {
        fetch('/set_theme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ theme: theme })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Theme preference saved:', data.theme);
            // Optionally, you can apply the theme immediately
            applyTheme(data.theme);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Function to apply the theme to the page
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        // You can define CSS variables or classes based on the theme
    }

    const theme = getThemePreference();
    sendThemeToServer(theme);
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

    // Variables to keep track of active tags
    let activeTags = [];

    function fetchShortcuts(params = {}) {
        const searchParams = new URLSearchParams();
    
        // Add domain parameter if provided
        if (params.domain) {
            searchParams.append('domain', params.domain);
        }
    
        // Search input
        if (searchInput.value) {
            searchParams.append('search', searchInput.value);
        }
    
        // Sort selection
        if (sortSelect.value) {
            searchParams.append('sort_by', sortSelect.value);
        }
    
        // Favorited filter
        if (favoritedFirstCheckbox.checked) {
            searchParams.append('favorited_first', 'true');
        }
    
        // Selected tags
        if (selectedTags.length > 0) {
            selectedTags.forEach(tagId => {
                searchParams.append('tags', tagId);
            });
        }
    
        fetch(`/api/shortcuts?${searchParams.toString()}`)
            .then(response => response.json())
            .then(shortcuts => {
                linksGrid.innerHTML = ''; // Clear previous results
                displayShortcuts(shortcuts);
            })
            .catch(error => {
                console.error('Error fetching shortcuts:', error);
            });
    }
    document.querySelectorAll('.domain-filter').forEach(filter => {
        filter.addEventListener('click', (e) => {
            e.preventDefault();
            const domain = filter.getAttribute('data-domain');
            fetchShortcuts({ domain: domain });
        });
    });
    // Modify fetchTags to accept searchParams
    // function fetchTags(searchParams) {
    //     fetch(`/api/tags?${searchParams.toString()}`)
    //         .then(response => response.json())
    //         .then(tags => {
    //             srenderTags(tags);
    //         });
    // }



    // Modify renderTags to implement hierarchical navigation
    // function srenderTags(tagsData) {
    //     tagsToolbar.innerHTML = '';

    //     function renderTagLevel(tags, level) {
    //         tags.forEach(tag => {
    //             const tagContainer = document.createElement('div');
    //             tagContainer.classList.add('flex', 'flex-shrink-0');

    //             const tagLabel = document.createElement('label');
    //             tagLabel.classList.add('tag-label', 'cursor-pointer');

    //             const tagSpan = document.createElement('span');
    //             tagSpan.className = 'text-xs font-mono';
    //             tagSpan.textContent = `${tag.name} (${tag.count})`;

    //             tagLabel.appendChild(tagSpan);
    //             tagContainer.appendChild(tagLabel);

    //             // Click event for the tag
    //             tagLabel.addEventListener('click', () => {
    //                 if (activeTags[level] && activeTags[level].id === tag.id) {
    //                     // Deselect current tag and remove deeper levels
    //                     activeTags = activeTags.slice(0, level);
    //                 } else {
    //                     // Select new tag and update activeTags
    //                     activeTags = activeTags.slice(0, level);
    //                     activeTags[level] = tag;
    //                 }
    //                 fetchShortcuts();
    //                 srenderTags(tagsData); // Re-render tags
    //             });

    //             tagsToolbar.appendChild(tagContainer);

    //             // If this tag is active, render children
    //             if (activeTags[level] && activeTags[level].id === tag.id) {
    //                 // Add chevron
    //                 const chevron = document.createElement('span');
    //                 chevron.textContent = ' > ';
    //                 chevron.className = 'chevron';
    //                 tagsToolbar.appendChild(chevron);

    //                 // Render child tags
    //                 if (tag.children && tag.children.length > 0) {
    //                     renderTagLevel(tag.children, level + 1);
    //                 }
    //             }
    //         });
    //     }

    //     // Start rendering from root level tags
    //     if (activeTags.length === 0) {
    //         renderTagLevel(tagsData, 0);
    //     } else {
    //         // Find the active path of tags
    //         let currentTags = tagsData;
    //         for (let i = 0; i < activeTags.length; i++) {
    //             const activeTag = activeTags[i];
    //             renderTagLevel([activeTag], i);
    //             if (activeTag.children && activeTag.children.length > 0) {
    //                 currentTags = activeTag.children;
    //             } else {
    //                 currentTags = [];
    //             }
    //         }
    //         if (currentTags.length > 0) {
    //             renderTagLevel(currentTags, activeTags.length);
    //         }
    //     }
    // }

    // function renderTagTree(tags, parentElement) {
    //     const ul = document.createElement('ul');
    //     ul.classList.add('tag-tree');
    //     tags.forEach(tag => {
    //         const li = document.createElement('li');
    //         li.classList.add('tag-item');
    
    //         const tagLabel = document.createElement('span');
    //         tagLabel.textContent = `${tag.name} (${tag.count})`;
    //         tagLabel.classList.add('tag-label');
    //         tagLabel.addEventListener('click', () => {
    //             // Handle tag selection
    //             handleTagClick(tag.id);
    //         });
    
    //         li.appendChild(tagLabel);
    
    //         if (tag.children && tag.children.length > 0) {
    //             const toggleButton = document.createElement('button');
    //             toggleButton.textContent = '+';
    //             toggleButton.classList.add('toggle-button');
    //             toggleButton.addEventListener('click', () => {
    //                 li.classList.toggle('expanded');
    //             });
    //             li.insertBefore(toggleButton, tagLabel);
    
    //             renderTagTree(tag.children, li);
    //         }
    
    //         ul.appendChild(li);
    //     });
    //     parentElement.appendChild(ul);
    // }
    
    
    // Usage in srenderTags
    function srenderTags(tagsData) {
        tagsToolbar.innerHTML = '';
        const tagList = document.createElement('ul');
        tagList.classList.add('tag-tree');
        tagList.classList.add('max-h-unset', 'overflow-hidden');
        renderTagTree(tagsData, tagList);
        tagsToolbar.appendChild(tagList);
    }
    
    // Event listeners
    searchInput.addEventListener('input', debounce(() => {
        fetchShortcuts();
      }, 300));

    sortSelect.addEventListener('change', () => {
        fetchShortcuts();
    });

    favoritedFirstCheckbox.addEventListener('change', () => {
        fetchShortcuts();
    });

    function handleTagSelection(tagId) {
        const index = selectedTags.indexOf(tagId);
        if (index > -1) {
            selectedTags.splice(index, 1);
        } else {
            selectedTags.push(tagId);
        }
    }
    closeModalBtn.addEventListener('click', () => {

        linkForm.reset();
        closeModal();
    });
    // Display shortcuts in the grid
    function displayShortcuts(shortcuts) {
        // Clear the grid with a fade-out effect
        linksGrid.querySelectorAll('article').forEach(article => {
            article.classList.add('opacity-0');
            setTimeout(() => {
                article.remove();
            }, 200);
        });

        // Delay adding new items to allow the fade-out to complete
        setTimeout(() => {
            shortcuts.forEach(shortcut => {
                // Create the <article> element
                const article = document.createElement('article');
                article.className = 'transition-all duration-200 opacity-0 link-card';
                const averageLuminance = calculateAverageLuminance(shortcut.color_from, shortcut.color_to);
                const textColor = 'text-white';
                const overlayStrength = averageLuminance > 0.5 ? 'luminanceneg' : 'luminancepos' ;
                article.className = 'transition-all duration-200 opacity-1  link-card ';

                // Create the link card container
                const linkCard = document.createElement('a');
                linkCard.href = shortcut.link;
                linkCard.target = '_blank';
                linkCard.setAttribute('aria-label', 'Visit ' + shortcut.name);
                linkCard.className = `link-card ${overlayStrength} relative h-48 z-0 mx-auto flex flex-col items-center justify-center bg-gradient-to-br p-4 filter overflow-hidden transition-all duration-200 h-40 rounded-lg`;
                linkCard.style.backgroundImage = `linear-gradient(to bottom right, ${shortcut.color_from}, ${shortcut.color_to})`;

                // Add gradient overlay
                const gradientOverlay = document.createElement('div');
                gradientOverlay.className = averageLuminance < 0.9 ?  'absolute left-0 top-0 h-full w-full dark:highlight-white  bg-gradient-to-br from-white/10 to-black/10' : 'absolute left-0 top-0 h-full w-full  bg-gradient-to-b from-black/30 to-black/50';
                linkCard.appendChild(gradientOverlay);

               
                // Status badge (e.g., "Shortcut")
                const statusBadgeContainer = document.createElement('div');
                statusBadgeContainer.className = 'absolute hidden opacity-0 flex flex-wrap content-start gap-1 overflow-hidden top-3 text-xs  transition-opacity duration-200';
                const statusBadge = document.createElement('div');
                statusBadge.className = `inline-flex cursor-pointer select-none items-center overflow-hidden font-mono rounded bg-white/30 leading-tight p-1 text-white opacity-100`;
                const statusBadgeContent = document.createElement('div');
               
                // Get tags array and convert to hierarchy string
                const tags = shortcut.tags || [];
                const tagStrings = tags.map(tag => {
                    const parts = tag.split('>').map(t => t.trim());
                    let result = '';
                    parts.forEach((part, index) => {
                        if (index > 0) {
                            result += ' > ';
                        }
                        result += part;
                    });
                    return result;
                });

                if(tags.length !== 0){
                // Create span for each tag
                tagStrings.forEach(tag => {
                    const tagSpan = document.createElement('span');
                    tagSpan.className = 'inline-flex items-center px-1 py-0';
                    tagSpan.textContent = tag;
                    statusBadge.appendChild(tagSpan);

                    // Add separator between tags
                    if (tagStrings.indexOf(tag) < tagStrings.length - 1) {
                        const separator = document.createElement('span');
                        separator.className = 'px-0.5';
                        separator.textContent = '•';
                        statusBadge.appendChild(separator);
                    }
                });
                statusBadgeContainer.appendChild(statusBadge);
                linkCard.appendChild(statusBadgeContainer);
                }
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
                emojiContainer.className = 'absolute text-center flex items-center justify-center -mt-1 opacity-50  transition-opacity duration-200';
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
                emojiSpan.className = 'emoji  inline absolute text-7xl mb-1 transition-transform duration-200';
          
                emojiSpan.textContent = shortcut.emojis || '🔗';

                // Assemble the structure
                emojiContainer.appendChild(blurredEmoji);
                emojiContainer.appendChild(emojiSpan);
                linkCard.appendChild(emojiContainer);

                // Card Title (name)
                const nameDiv = document.createElement('h4');
                nameDiv.className = `card-title z-40 overflow-visible p-5 py-8 max-w-full truncate text-center font-bold  ${textColor} text-2xl transition-transform duration-200`;
                nameDiv.style.textShadow = '0px 3px 40px rgba(0, 0, 0, 0.8)';
                nameDiv.textContent = shortcut.name;
                linkCard.appendChild(nameDiv);
                const descriptionDiv = document.createElement('div');

                const descriptionText = document.createElement('p');
                const descriptionSpan = document.createElement('span');
                // Short description (if present)
                if (shortcut.short_description) {
                   
                    const svgDecor = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="pointer-events-none absolute left-0 h-full -translate-x-full text-black/15" viewBox="0 0 16 12"><path fill="currentColor" d="M9.49 6.13C8.07 10.7 6.09 12 0 12h16V0c-3.5 0-4.97 1.2-6.51 6.13Z"></path></svg>`
                   
                    descriptionDiv.innerHTML= svgDecor;
                    descriptionText.className = `bg-black/15 transition-all duration-200 leading-tight `;
                    descriptionSpan.className = `truncate break-words py-0.5  text-white/80 pr-2 text-[0.78rem] -ml-1 transition-opacity duration-200`;
                    descriptionSpan.textContent = shortcut.short_description;
                    descriptionText.appendChild(descriptionSpan);
                    descriptionDiv.appendChild(descriptionText);

                    descriptionDiv.className = 'absolute bottom-0 right-0 z-40 flex max-w-[83%] items-center';
      
                    linkCard.appendChild(descriptionDiv);
                }

                const iconsContainer = document.createElement('span');
                iconsContainer.classList.add('shortcut-icons-container', 'gap-2', 'absolute', 'top-2', 'left-2', 'transition-opacity', 'text-lg', 'duration-200');
                iconsContainerFlex = document.createElement('div');
                iconsContainerFlex.classList.add('flex', 'gap-2','transition-opacity', 'text-lg', 'duration-200');
            if (shortcut.pinned) {
                const pinnedIcon = document.createElement('i');
                pinnedIcon.className = 'favorited-icon  fa fa-solid drop-shadow-md  fa-bookmark  text-white cursor-pointer hover:text-indigo-100 transition-opacity duration-200';
              
                iconsContainerFlex.appendChild(pinnedIcon);
            }
            else if (!shortcut.pinned) {
                const pinnedIcon = document.createElement('i');
                pinnedIcon.className = 'favorited-icon  fa fa-regular drop-shadow-md  fa-bookmark opacity-40 text-white cursor-pointer hover:text-indigo-100 transition-opacity duration-200';
              
                iconsContainerFlex.appendChild(pinnedIcon);
            }
            if (shortcut.favorited) {
                const favoritedIcon = document.createElement('i');
                favoritedIcon.className = 'pinned-icon  fa fa-solid drop-shadow-md  fa-heart text-white cursor-pointer hover:text-indigo-100 transition-opacity duration-200';
              
                iconsContainerFlex.appendChild(favoritedIcon);
            }
            else if (!shortcut.favorited) {
                const favoritedIcon = document.createElement('i');
                favoritedIcon.className = 'pinned-icon  fa fa-regular drop-shadow-md   fa-heart opacity-40 text-white cursor-pointer hover:text-indigo-100 transition-opacity duration-200';
              
                iconsContainerFlex.appendChild(favoritedIcon);
            }   
            iconsContainer.appendChild(iconsContainerFlex);
                // Trash icon for deletion
                const ActionIconsWR = document.createElement('span');
                const trashIcon = document.createElement('i');
                const editIcon = document.createElement('i');
                ActionIconsWR.classList.add('action-items-container', 'absolute', 'bottom-2', 'left-2', 'opacity-0', 'transition-opacity', 'text-lg', 'duration-200');
                trashIcon.className = 'trash-icon  fa fa-solid drop-shadow-md  fa-trash  text-white/80 cursor-pointer hover:text-white/100 transition-opacity duration-200';
                editIcon.className = 'ml-2 edit-icon  fa fa-solid drop-shadow-md  fa-pencil  text-white/80 cursor-pointer hover:text-white/100 transition-opacity duration-200';
                
                ActionIconsWR.appendChild(trashIcon);
                ActionIconsWR.appendChild(editIcon);
                

                linkCard.appendChild(iconsContainer);
                linkCard.appendChild(ActionIconsWR);

                // Event listener for hover
                linkCard.addEventListener('mouseenter', () => {
                    if (isCmdPressed) {
                        ActionIconsWR.classList.remove('opacity-0');
                    }
                    statusBadgeContainer.classList.remove('hidden');
                    iconContainer.classList.remove('hidden');
                    iconContainer.classList.remove('opacity-0');
                    statusBadgeContainer.classList.remove('opacity-0');
                    descriptionSpan.classList.remove('text-white/80');
                    descriptionSpan.classList.add('text-white');
                    
                    iconContainer.classList.add('opacity-80');
                    statusBadgeContainer.classList.add('opacity-100');
                    emojiContainer.classList.add('opacity-100');
                    emojiSpan.classList.remove('opacity-40');
                    emojiSpan.classList.add('opacity-100');

                });
               

                linkCard.addEventListener('mouseleave', () => {
                    
                        ActionIconsWR.classList.add('opacity-0');
                    
                    iconContainer.classList.add('opacity-0');
                    statusBadgeContainer.classList.add('opacity-0');
                    iconContainer.classList.remove('opacity-80');
                    statusBadgeContainer.classList.remove('opacity-100');
                    descriptionSpan.classList.add('text-white/80');
                    descriptionSpan.classList.remove('text-white');
                    emojiContainer.classList.remove('opacity-100');
                    setTimeout(() => {
                        statusBadgeContainer.classList.add('hidden');
                        iconContainer.classList.add('hidden');
                    }, 200);
                });

                       // Action confirmation handlers
            trashIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this shortcut?')) {
                    deleteShortcut(shortcut.id);
                }
            });

            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Do you want to edit this shortcut?')) {
                    openModal(shortcut);
                }
            });

            // Add confirmation to favorite/pin actions
            iconsContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                const target = e.target;
                
                if (target.classList.contains('fa-solid') || target.classList.contains('fa-regular')) {
                    if (confirm('Do you want to change the favorite status of this shortcut?')) {
                        // Toggle favorite status
                        fetch(`/api/shortcuts/${shortcut.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                ...shortcut,
                                favorited: !shortcut.favorited
                            })
                        }).then(() => fetchShortcuts());
                    }
                }
                
                if (target.classList.contains('fa-bookmark') || target.classList.contains('fa-bookmark-o')) {
                    if (confirm('Do you want to change the pinned status of this shortcut?')) {
                        // Toggle pinned status
                        fetch(`/api/shortcuts/${shortcut.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                ...shortcut,
                                pinned: !shortcut.pinned
                            })
                        }).then(() => fetchShortcuts());
                    }
                }
            });

                // Click event for emoji animation and navigation
                linkCard.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent immediate navigation
                  
                    if (event.target.closest('.action-items-container')) return;
                    if (event.target.closest('.shortcut-icons-container')) return;
                      const emojis = linkCard.querySelectorAll('.emoji')[0].innerHTML;
                    // console.log(emojis);
                    // const emojiArray = emojis.split(''); // Split emojis into an array
                    const splitEmoji = (string) => [...new Intl.Segmenter().segment(string)].map(x => x.segment)
                    // console.log(splitEmoji(emojis));
                    const count = 8;
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
                domainSpan.className = 'flex items-center gap-1 text-indigo-900 dark:text-blue-50 text-xs font-mono mt-1';
                const favIconWrapper = document.createElement('span');
                favIconWrapper.className = ' rounded m-1';
                // Create the favicon image
                
              



                // Create the favicon image
                const faviconImg = document.createElement('img');
                faviconImg.classList.add(
                    'w-5',
                    'h-5',
                    'p-0.5',
                    'bg-gray-300',
                    'dark:bg-gray-700',
                    'rounded',
                    'skeleton-loading',
                    // 'bg-[length:200px_100%]',
                    // 'bg-left'
                );

                 // Handle image loading
  faviconImg.onload = () => {
    // Remove skeleton classes after image loads
    faviconImg.classList.remove(
      'bg-gray-300',
      'dark:bg-gray-700',
      'skeleton-loading',
    //   'bg-gradient-to-r',
    //   'from-gray-300',
    //   'to-gray-400',
    //   'bg-[length:200px_100%]',
    //   'bg-left'
    );
  };

  

  // Determine theme preference
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = isDarkMode ? 'dark' : 'light';


  faviconImg.src = `/get_favicon?domain=${encodeURIComponent(domain)}&theme=${theme}`;

                // Create the domain text
                const domainText = document.createElement('span');
                domainText.textContent = domain;

                // Append the favicon and text to the span
                favIconWrapper.appendChild(faviconImg);
                domainSpan.appendChild(favIconWrapper);
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

  
    function createEmoji(x, y, emojiArray) {
        const gravity = 0;
        const friction = 0.99;
        
        // Create multiple ripples with stagger
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

            // Remove ripple after animation
            setTimeout(() => ripple.remove(), 500 + (i * 100));
        }

        // Create emojis with stagger
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
            }, i * 10); // 10ms stagger between each emoji
        }

        // Add keyframe animation for ripple effect
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
 // Fetch and render tags
 
function fetchTags() {
    fetch('/api/tags')
    .then(response => response.json())
    .then(data => {
        srenderTags(data);
    })
    .catch(error => {
        console.error('Error fetching tags:', error);
    });
}

function renderTagTree(tags, container, level = 0) {
    tags.forEach((tag, index) => {
        const isLast = index === tags.length - 1;

        // Main container for each tag item
        const tagItemWrap = document.createElement('div');
        tagItemWrap.className = 'flex h-[28px] w-full items-center justify-between gap-1.5';
        tagItemWrap.style.paddingLeft = `${level * 20}px`; // Adjust padding based on level

        // Icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'relative h-[28px] w-[19px] flex-none';

        // Left vertical line
        const leftLine = document.createElement('div');
        leftLine.className = 'left absolute inset-y-0 -top-[3px] left-0 w-px bg-gray-300 dark:bg-gray-700';
        if (isLast) {
            leftLine.style.bottom = '28px'; // Adjust the bottom position for the last item
        }
        iconContainer.appendChild(leftLine);

        // SVG icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'text-gray-300 dark:text-gray-700');
        svg.setAttribute('width', '19');
        svg.setAttribute('height', '28');
        svg.setAttribute('viewBox', '0 0 19 28');
        svg.innerHTML = '<path fill-rule="evenodd" clip-rule="evenodd" d="M1 0C1 7.42391 7.4588 13.5 15.5 13.5V14.5C6.9726 14.5 0 8.04006 0 0H1Z" fill="currentColor"></path>';
        iconContainer.appendChild(svg);

        tagItemWrap.appendChild(iconContainer);

        // Tag name
        const tagName = document.createElement('div');
        tagName.className = 'font-semibold';
        tagName.textContent = tag.name;
        tagItemWrap.appendChild(tagName);

        // Separator line
        const separatorLine = document.createElement('div');
        separatorLine.className = 'mx-3 flex-1 translate-y-[2.5px] self-center border-b border-dotted dark:border-gray-800';
        tagItemWrap.appendChild(separatorLine);

        // Tag link with count
        const tagLink = document.createElement('a');
        tagLink.className = 'text-gray-700 underline decoration-gray-300 hover:text-gray-900 hover:decoration-gray-600 dark:text-gray-300 dark:decoration-gray-500 dark:hover:text-gray-100 dark:hover:decoration-gray-200';
        tagLink.href = `#`; // Adjust the URL as needed
        tagLink.textContent = `${tag.count} Tags`;
        tagItemWrap.appendChild(tagLink);

        // Event listener for the tag link
        tagLink.addEventListener('click', (e) => {
            e.preventDefault();
            const tagId = tag.id;
            if (tagId) {
                handleTagSelection(parseInt(tagId));
                tagLink.classList.toggle('selected');
                fetchTags();
            }
        });

        container.appendChild(tagItemWrap);

        // Recursively render child tags
        if (tag.children && tag.children.length > 0) {
            renderTagTree(tag.children, container, level + 1);
        }
    });
}

function renderTags(tagsData) {
    tagsToolbar.innerHTML = '';

    function createTagElement(tag) {
        const tagItem = document.createElement('div');
        tagItem.classList.add('tag-item');

        const tagLabel = document.createElement('label');
        tagLabel.classList.add('tag-label', 'cursor-pointer');
        tagLabel.textContent = `${tag.name} (${tag.count})`;

        tagLabel.addEventListener('click', () => {
            handleTagSelection(tag.id);
            tagLabel.classList.toggle('selected');
        });

        tagItem.appendChild(tagLabel);

        if (tag.children && tag.children.length > 0) {
            const childTagsContainer = document.createElement('div');
            childTagsContainer.classList.add('child-tags');

            tag.children.forEach(childTag => {
                const childTagItem = createTagElement(childTag);
                childTagsContainer.appendChild(childTagItem);
            });

            tagItem.appendChild(childTagsContainer);
        }

        return tagItem;
    }

    tagsData.forEach(tag => {
        const tagElement = createTagElement(tag);
        tagsToolbar.appendChild(tagElement);
    });
}

function handleTagSelection(tagId) {
    const index = selectedTags.indexOf(tagId);
    if (index > -1) {
        selectedTags.splice(index, 1);
    } else {
        selectedTags.push(tagId);
    }
    fetchShortcuts();
}

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
            document.querySelectorAll('.link-card:hover .actions-items-contaienr').forEach(icon => {
                icon.classList.remove('opacity-0');
            });
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!e.metaKey && !e.ctrlKey) {
            isCmdPressed = false;
            // Hide all trash icons
            document.querySelectorAll(' .actions-items-contaienr').forEach(icon => {
                icon.classList.add('opacity-0');
            });
        }
    });

    favFilterContainer.addEventListener('click', (e) => {
        e.preventDefault();
        favoritedFirstCheckbox.checked = !favoritedFirstCheckbox.checked;
        
        if (favoritedFirstCheckbox.checked) {
            
            favoritedIcon.classList.remove('fa-regular', 'text-indigo-700');
            favoritedIcon.classList.add('fa-solid', 'text-white');
            favFilterContainer.classList.add('dark:from-red-600', 'dark:to-red-400');
            favoritedText.classList.remove('dark:from-indigo-950');
            favoritedText.classList.remove('text-indigo-700');
            favoritedText.classList.add('text-white');
            
            fetchShortcuts();
            // Update opacity for all shortcuts
            document.querySelectorAll('.link-card').forEach(card => {
                const isFavorited = card.querySelector('.fa-solid') !== null;
                card.style.opacity = isFavorited ? '1' : '0.5';
            });
        } else {
            favoritedIcon.classList.remove('fa-solid', 'text-white');
            favoritedIcon.classList.add('fa-regular', 'text-red-700');
            favFilterContainer.classList.remove('dark:from-red-600', 'dark:to-red-400');
            favoritedText.classList.remove('text-white');
            favoritedText.classList.add('text-red-700');
            
            fetchShortcuts(favoritedFirstCheckbox.checked);
            // Reset opacity for all shortcuts
            document.querySelectorAll('article.link-card').forEach(card => {
                card.style.opacity = '1';
            });
        }
        
        // fetchShortcuts();
    });
    

    // Open modal for adding/editing
    addLinkBtn.addEventListener('click', () => openModal());

    // Close modal
    // closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === ContainerModal) {
            closeModal();
        }
    });

     // Handle form submission
     linkForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission
        
        const shortcutData = {
            id: linkIdField.value,
            name: linkNameField.value,
            link: linkUrlField.value,
            tags: linkTagsField.value.split(',').map(tag => tag.trim()),
            emojis: linkEmojisField.value,
            color_from: colorFromField.value,
            color_to: colorToField.value,
            short_description: shortDescriptionField.value,
            score: parseFloat(scoreField.value) || 0,
            pinned: pinnedField.checked,
            favorited: favoritedField.checked
        };
    
        const method = shortcutData.id ? 'PUT' : 'POST';
        const url = shortcutData.id ? `/api/shortcuts/${shortcutData.id}` : '/api/shortcuts';
    
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(shortcutData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            closeModal();
            fetchShortcuts();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error saving shortcut: ' + error.message);
        });
    });
   
    // Delete shortcut
    function deleteShortcut(id) {
        if (confirm('Are you sure you want to delete this link shortcut?')) {
            fetch(`/api/shortcuts/${id}`, {
                method: 'DELETE',
            })
                .then(response => response.json())
                .then(data => {
                    fetchShortcuts();
                })
                .catch(error => {
                    console.error('Error deleting shortcut:', error);
                });
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
    function openModal(shortcut = null) {
        if (shortcut) {
            // Editing existing shortcut
            linkIdField.value = shortcut.id;
            linkNameField.value = shortcut.name;
            linkUrlField.value = shortcut.link;
            linkTagsField.value = shortcut.tags.join(', ');
            linkEmojisField.value = shortcut.emojis;
            colorFromField.value = shortcut.color_from;
            colorToField.value = shortcut.color_to;
            shortDescriptionField.value = shortcut.short_description;
            scoreField.value = shortcut.score;
            pinnedField.checked = shortcut.pinned;
            favoritedField.checked = shortcut.favorited;
        } else {
            // Adding new shortcut
            linkForm.reset();
            linkIdField.value = '';
        }
        containerModal.classList.remove('hidden');
    }

    function closeModal() {
        linkForm.reset();
        linkIdField.value = '';
        containerModal.classList.add('hidden');
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
        // searchInput.addEventListener('input', fetchShortcuts);
        // selectedSort.addEventListener('click', fetchShortcuts);
    
       
    // Fetch initial data

    // Enable dragging to scroll on tagsToolbar
    // let isDragging = false;
    // let startX;
    // let scrollLeft;

    // tagsToolbar.addEventListener('mousedown', (e) => {
    //     isDragging = true;
    //     tagsToolbar.classList.add('dragging');
    //     startX = e.pageX - tagsToolbar.offsetLeft;
    //     scrollLeft = tagsToolbar.scrollLeft;
    // });

    // tagsToolbar.addEventListener('mouseleave', () => {
    //     isDragging = false;
    //     tagsToolbar.classList.remove('dragging');
    // });

    // tagsToolbar.addEventListener('mouseup', () => {
    //     isDragging = false;
    //     tagsToolbar.classList.remove('dragging');
    // });

    // tagsToolbar.addEventListener('mousemove', (e) => {
    //     if (!isDragging) return;
    //     e.preventDefault();
    //     const x = e.pageX - tagsToolbar.offsetLeft;
    //     const walk = (x - startX) * 1; // Adjust scroll speed
    //     tagsToolbar.scrollLeft = scrollLeft - walk;
    // });

    // Fetch and render tags
    fetch('/api/tags')
        .then(response => response.json())
        .then(data => {
            srenderTags(data);
        })
        .catch(error => {
            console.error('Error fetching tags:', error);
        });

  
        fetchShortcuts();
        fetchTags();
});
